import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import UploadModule from '../utils/upload-module.utils';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [
    UsersModule,
    UploadModule({
      path: 'profiles',
      validation: {
        allowedMimeTypes: ['image/jpeg', 'image/png'],
        maxSize: 2 * 1024 * 1024,
      },
    }),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
