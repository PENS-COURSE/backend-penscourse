import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { UsersModule } from '../users/users.module';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';

@Module({
  imports: [UsersModule, CoursesModule],
  providers: [CertificatesService],
  controllers: [CertificatesController],
})
export class CertificatesModule {}
