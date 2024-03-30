import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CoursesService } from '../courses/courses.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { HashHelpers } from '../utils/hash.utils';
import { ProducerService } from '../utils/library/event/producer.service';
import Certificate from './dto/Certificate';
import { UploadCertificateDto } from './dto/upload-certificate.dto';

@Injectable()
export class CertificatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courseService: CoursesService,
    private readonly userService: UsersService,
    private readonly producerService: ProducerService,
  ) {}

  async generateCertificate({
    user_id,
    course_slug,
  }: {
    user_id: number;
    course_slug: string;
  }) {
    const course = await this.courseService.findOneBySlug({
      slug: course_slug,
    });

    const user = await this.userService.findOneByID(user_id);

    const isEnrolled = await this.prisma.enrollment.findFirst({
      where: {
        user_id: user.id,
        course_id: course.id,
      },
    });

    if (!isEnrolled) {
      throw new ForbiddenException(
        'User tersebut belum terdaftar di kelas ini',
      );
    }

    await this.prisma.certificate.createMany({
      data: [
        {
          course_id: course.id,
          user_id: user.id,
          no_cert: `PENS-${uuidv4()}`,
          type: 'presence',
        },
        {
          course_id: course.id,
          user_id: user.id,
          no_cert: `PENS-${uuidv4()}`,
          type: 'competence',
        },
      ],
    });

    const getCertificates = await this.prisma.certificate.findMany({
      where: {
        user_id: user.id,
        course_id: course.id,
      },
    });

    await Promise.all(
      getCertificates.map(async (certificate) => {
        const requestToken = await this.prisma.requestToken.create({
          data: {
            token: await HashHelpers.hashPassword(uuidv4()),
            type: 'send_certificate',
          },
        });

        const data: Certificate = {
          type:
            certificate.type === 'presence'
              ? 'certificate of Attendance'
              : 'Certificate of Competency',
          course: course.name,
          course_instructor: course.user.name ?? '',
          date: new Date().toLocaleDateString(),
          duration: null,
          no_certificate: certificate.no_cert,
          participant_name: user.name,
          request_token: requestToken.token,
        };

        await this.producerService.publishInQueue({
          exchange: 'report',
          routingKey: 'certificate',
          data: data,
        });
      }),
    );

    return 'OK';
  }

  async uploadCertificate({
    body,
    file,
  }: {
    body: UploadCertificateDto;
    file: Express.Multer.File;
  }) {
    const user = await this.userService.findOneByID(body.user_id);

    const course = await this.courseService.findOneBySlug({
      slug: body.course_slug,
    });

    const certificate = await this.prisma.certificate.findFirst({
      where: {
        user_id: user.id,
        course_id: course.id,
      },
    });

    if (!certificate) throw new NotFoundException('Sertifikat tidak ditemukan');

    await this.prisma.certificate.update({
      where: {
        id: certificate.id,
      },
      data: {
        certificate_url: file.path,
      },
    });

    // TODO: SEND NOTIFICATION TO USER
    // TODO: EXPORT PDF TO JPEG
  }
}
