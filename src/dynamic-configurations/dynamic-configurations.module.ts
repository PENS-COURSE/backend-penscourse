import { Module } from '@nestjs/common';
import { DynamicConfigurationsService } from './dynamic-configurations.service';
import { DynamicConfigurationsController } from './dynamic-configurations.controller';

@Module({
  controllers: [DynamicConfigurationsController],
  providers: [DynamicConfigurationsService],
})
export class DynamicConfigurationsModule {}
