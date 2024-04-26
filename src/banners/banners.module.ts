import { Module } from '@nestjs/common';
import UploadModule from '../utils/upload-module.utils';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';

@Module({
  imports: [UploadModule({ path: 'banners' })],
  controllers: [BannersController],
  providers: [BannersService],
})
export class BannersModule {}
