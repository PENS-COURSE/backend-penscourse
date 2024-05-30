import { Module } from '@nestjs/common';
import UploadModule from '../utils/upload-module.utils';
import { LogoController } from './logo.controller';
import { LogoService } from './logo.service';

@Module({
  imports: [
    UploadModule({
      path: 'logos',
      validation: {
        allowedMimeTypes: ['image/png', 'image/jpeg'],
        maxSize: 2 * 1024 * 1024,
      },
    }),
  ],
  controllers: [LogoController],
  providers: [LogoService],
})
export class LogoModule {}
