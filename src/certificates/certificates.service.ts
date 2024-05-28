import { Injectable } from '@nestjs/common';
import { CoursesService } from '../courses/courses.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { HandleCertificateCreationDto } from './dto/upload-certificate.dto';

@Injectable()
export class CertificatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courseService: CoursesService,
    private readonly userService: UsersService,
  ) {}

  async handleCertificateGenerated({
    payload,
  }: {
    payload: HandleCertificateCreationDto;
  }) {
    const { user_id, course_id, file_pdf, file_jpg, certificate_type } =
      payload;

    const user = await this.userService.findOneByID(user_id);

    const course = await this.courseService.findOneByID(course_id);

    const certificate = await this.prisma.certificate.findFirst({
      where: {
        user_id,
        course_id,
      },
    });

    const getLastNoCert = await this.prisma.certificate.findFirst({
      where: {
        type: certificate_type,
      },
      orderBy: {
        id: 'desc',
      },
    });

    const year = new Date().getFullYear();
    const type = certificate_type === 'presence' ? 'P' : 'C';
    const formatId = String(getLastNoCert ? getLastNoCert.id + 1 : 1).padStart(
      4,
      '0',
    );
    const noCert = `PENS-${year}-${type}-${formatId}`;

    if (certificate) {
      await this.prisma.certificate.update({
        where: {
          id: certificate.id,
        },
        data: {
          certificate_url: file_pdf,
          no_cert: noCert,
        },
      });
    } else {
      await this.prisma.certificate.create({
        data: {
          user_id: user.id,
          course_id: course.id,
          type: certificate_type,
          certificate_url: file_pdf,
          certificate_thumbnail: file_jpg,
          no_cert: noCert,
        },
      });
    }
  }
}
