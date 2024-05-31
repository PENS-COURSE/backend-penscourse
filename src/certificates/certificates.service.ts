import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Queue } from 'bull';
import { plainToInstance } from 'class-transformer';
import { CoursesService } from '../courses/courses.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserEntity } from '../users/entities/user.entity';
import { createPaginator } from '../utils/pagination.utils';
import { NotificationType, notificationWording } from '../utils/wording.utils';
import { GenerateCertificateDto } from './dto/generate-certificate.dto';
import { HandleCertificateCreationDto } from './dto/upload-certificate.dto';

@Injectable()
export class CertificatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courseService: CoursesService,
    private readonly notificationService: NotificationsService,
    @InjectQueue('certificates') private readonly certificatesQueue: Queue,
  ) {}

  async generateCertificate({ payload }: { payload: GenerateCertificateDto }) {
    const course = await this.prisma.course.findFirst({
      where: {
        slug: payload.course_slug,
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

    if (!course) throw new NotFoundException('Kelas tidak ditemukan');

    const isSameQuiz = payload.list_daily_quiz_ids.some((id) =>
      payload.list_final_quiz_ids.includes(id),
    );
    if (isSameQuiz)
      throw new BadRequestException(
        `Quiz harian atau quiz akhir tidak boleh sama, silahkan cek kembali !`,
      );

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
      include: {
        course: true,
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

      const wording = notificationWording(
        NotificationType.certificate_generated,
      );

      await this.notificationService.sendNotification({
        user_ids: [certificate.user_id],
        title: wording.title,
        body: wording.body.replace('[nameCourse]', certificate.course.name),
        type: wording.type,
        action_id: certificate.uuid,
      });

      // Todo: Send Email
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

  async getCertificatesByUser({
    user,
    page,
    limit,
  }: {
    user: User;
    page: number;
    limit: number;
  }) {
    const paginator = createPaginator({
      page,
      perPage: limit,
    });

    if (limit > 100) {
      limit = 100;
    }

    return await paginator({
      model: this.prisma.certificate,
      args: {
        where: {
          user_id: user.id,
          certificate_thumbnail: {
            not: null,
          },
          certificate_url: {
            not: null,
          },
        },
        include: {
          course: true,
        },
        orderBy: [
          {
            created_at: 'desc',
          },
        ],
      },

      options: {
        page,
        perPage: limit,
      },
    });
  }

  async getCertificatesByCourse({
    course_slug,
    page,
    limit,
  }: {
    course_slug: string;
    page: number;
    limit: number;
  }) {
    const paginator = createPaginator({
      page,
      perPage: limit,
    });

    if (limit > 100) {
      limit = 100;
    }

    const course = await this.courseService.findOneBySlug({
      slug: course_slug,
    });

    return await paginator({
      model: this.prisma.certificate,
      args: {
        where: {
          course_id: course.id,
        },
        include: {
          user: true,
        },
        orderBy: [
          {
            created_at: 'desc',
          },
        ],
      },
      options: {
        page,
        perPage: limit,
      },
      map: async (certificates) => {
        return certificates.map((certificate) => {
          return {
            ...certificate,
            user: plainToInstance(UserEntity, certificate.user, {}),
          };
        });
      },
    });
  }

  async getCertificateByUuid({
    certificate_uuid,
    user,
  }: {
    certificate_uuid: string;
    user: User;
  }) {
    if (user.role === 'user') {
      const certificate = await this.prisma.certificate.findFirst({
        where: {
          uuid: certificate_uuid,
          user_id: user.id,
        },
        include: {
          course: true,
          user: true,
        },
      });

      if (!certificate)
        throw new NotFoundException('Sertifikat tidak ditemukan');

      return {
        ...certificate,
        user: plainToInstance(UserEntity, certificate.user, {}),
      };
    } else if (user.role === 'admin' || user.role === 'dosen') {
      const certificate = await this.prisma.certificate.findFirst({
        where: {
          uuid: certificate_uuid,
        },
        include: {
          course: true,
          user: true,
        },
      });

      if (!certificate)
        throw new NotFoundException('Sertifikat tidak ditemukan');

      return {
        ...certificate,
        user: plainToInstance(UserEntity, certificate.user, {}),
      };
    }
  }
}
