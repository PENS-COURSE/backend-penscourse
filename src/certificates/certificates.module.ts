import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CoursesModule } from '../courses/courses.module';
import { UsersModule } from '../users/users.module';
import { CertificatesConsumer } from './certificates.consumer';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';

@Module({
  imports: [
    UsersModule,
    CoursesModule,
    BullModule.registerQueue({ name: 'certificates' }),
    ClientsModule.register([
      {
        name: 'CERTIFICATE_GENERATOR_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.CERTIFICATE_SERVICE_RABBITMQ_URL],
          queue: process.env.CERTIFICATE_SERVICE_QUEUE_NAME,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [CertificatesService, CertificatesConsumer],
  controllers: [CertificatesController],
})
export class CertificatesModule {}
