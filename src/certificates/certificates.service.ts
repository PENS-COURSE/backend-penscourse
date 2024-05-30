import { InjectQueue } from '@nestjs/bull';
import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { User } from '@prisma/client';
import { Queue } from 'bull';
import { CoursesService } from '../courses/courses.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { GenerateCertificateDto } from './dto/generate-certificate.dto';
import { HandleCertificateCreationDto } from './dto/upload-certificate.dto';

@Injectable()
export class CertificatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courseService: CoursesService,
    private readonly userService: UsersService,
    @InjectQueue('certificates') private readonly certificatesQueue: Queue,
  ) {}

  async generateCertificate({ payload }: { payload: GenerateCertificateDto }) {
    const course = await this.prisma.course.findFirst({
      where: {
        slug: 'dasar-dasar-sistem-telekomunikasi-qz94kv',
      },
      include: {
        enrollments: true,
        curriculums: {
          include: {
            live_classes: {
              include: {
                ParticipantLiveClass: true,
              },
            },
            quizzes: {
              include: {
                sessions: true,
              },
            },
          },
        },
      },
    });

    // Daily Quiz Check Ids Validation
    await Promise.all(
      payload.list_daily_quiz_ids.map(async (quiz_id) => {
        // Check ids quiz
        const quiz = course?.curriculums
          .map((curriculum) => curriculum.quizzes)
          .flat()
          .find((quiz) => quiz.id === quiz_id);

        if (!quiz)
          throw new NotFoundException(
            `Quiz dengan id ${quiz_id} tidak ditemukan, silahkan cek kembali`,
          );
      }),
    );

    // Final Quiz Check Ids Validation
    await Promise.all(
      payload.list_final_quiz_ids.map(async (quiz_id) => {
        // Check ids quiz
        const quiz = course.curriculums
          .map((curriculum) => curriculum.quizzes)
          .flat()
          .find((quiz) => quiz.id === quiz_id);

        if (!quiz)
          throw new NotFoundException(
            `Quiz dengan id ${quiz_id} tidak ditemukan, silahkan cek kembali`,
          );
      }),
    );

    // Participant Check Ids Validation
    await Promise.all(
      payload.list_participant_ids.map(async (participant_id) => {
        // Check ids participant
        const participant = course.enrollments
          .map((enrollment) => enrollment.user_id)
          .find((id) => id === participant_id);

        if (!participant)
          throw new NotFoundException(
            `Participant dengan id ${participant_id} tidak ditemukan, silahkan cek kembali`,
          );
      }),
    );

    await this.certificatesQueue.add('generator-certificate', payload);

    return 'Sertifikat sedang diproses, mohon tunggu beberapa saat';
  }

  async handleCertificateGenerated({
    payload,
  }: {
    payload: HandleCertificateCreationDto;
  }) {
    const { file_pdf, file_jpg, certificate_id } = payload;

    const certificate = await this.prisma.certificate.findFirst({
      where: {
        no_cert: certificate_id,
      },
    });

    if (certificate) {
      await this.prisma.certificate.update({
        where: {
          id: certificate.id,
        },
        data: {
          certificate_url: file_pdf,
          certificate_thumbnail: file_jpg,
        },
      });

      // TODO: Send Notification to User
    }
  }

  async getThumbnailBlob({ thumbnail_path }: { thumbnail_path: string }) {
    const thumbnail = await this.prisma.certificate.findFirst({
      where: {
        certificate_thumbnail: thumbnail_path,
      },
    });

    if (!thumbnail) {
      throw new NotFoundException('Thumbnail tidak ditemukan');
    }

    const buffer = await fetch(
      `${process.env.CERTIFICATE_SERVICE_PUBLIC_URL}${thumbnail.certificate_thumbnail}`,
    ).then(async (res) => await res.arrayBuffer());

    const uint8Array = new Uint8Array(buffer);
    return new StreamableFile(uint8Array);
  }

  async requestDownloadCertificate({
    certificate_uuid,
    user,
  }: {
    certificate_uuid: string;
    user: User;
  }) {
    const certificate = await this.prisma.certificate.findFirst({
      where: {
        uuid: certificate_uuid,
        user_id: user.id,
      },
    });

    if (!certificate) throw new NotFoundException('Sertifikat tidak ditemukan');

    const buffer = await fetch(
      `${process.env.CERTIFICATE_SERVICE_PUBLIC_URL}${certificate.certificate_url}`,
    ).then(async (res) => await res.arrayBuffer());

    const uint8Array = new Uint8Array(buffer);
    return new StreamableFile(uint8Array);
  }
}
