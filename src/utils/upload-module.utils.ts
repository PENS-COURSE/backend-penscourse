import { DynamicModule } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

const UploadModule = ({ path }): DynamicModule => {
  return MulterModule.register({
    dest: `./public/uploads/${path}`,
    storage: diskStorage({
      destination: `./public/uploads/${path}`,
      filename: (req, file, cb) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        return cb(null, `${randomName}${file.originalname}`);
      },
    }),
  }); // Return an empty object
};

export default UploadModule;
