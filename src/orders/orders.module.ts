import { Module } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CoursesModule } from '../courses/courses.module';
import { XenditModule } from '../utils/library/xendit/xendit.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    CoursesModule,
    XenditModule.registerAsync({
      inject: [PrismaService],
      useFactory: async (prisma: PrismaService) => {
        const xendit = await prisma.dynamicConfigurations.findFirst({
          where: {
            title: 'Xendit',
          },
          include: {
            DynamicConfigurationValues: true,
          },
        });

        return {
          XENDIT_API_KEY:
            xendit?.DynamicConfigurationValues.find(
              (value) => value.key === 'XENDIT_API_KEY',
            )?.value ?? process.env.XENDIT_API_KEY,
          SUCCESS_REDIRECT_URL:
            xendit?.DynamicConfigurationValues.find(
              (value) => value.key === 'SUCCESS_REDIRECT_URL',
            )?.value ?? process.env.SUCCESS_REDIRECT_URL,
          FAILURE_REDIRECT_URL:
            xendit?.DynamicConfigurationValues.find(
              (value) => value.key === 'FAILURE_REDIRECT_URL',
            )?.value ?? process.env.FAILURE_REDIRECT_URL,
          LOCALE: 'id',
          CURRENCY: 'IDR',
        };
      },
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
