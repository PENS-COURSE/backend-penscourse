import { BadRequestException, DynamicModule } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { StorageHelpers } from './storage.utils';

interface UploadModule {
  path: string;
  validation?: {
    allowedMimeTypes?: string[];
    maxSize?: number;
    customMessage?: {
      allowedMimeTypes?: string;
      maxSize?: string;
    };
  };
}

const UploadModule = ({ path, validation }: UploadModule): DynamicModule => {
  return MulterModule.register({
    dest: `./public/uploads/${path}`,
    storage: diskStorage({
      destination: `./public/uploads/${path}`,
      filename: (req, file, callback) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');

        const allowedMimeTypes = validation?.allowedMimeTypes;
        const maxSize = validation?.maxSize;

        if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              validation?.customMessage?.allowedMimeTypes ||
                `File type not allowed, please upload a valid file type (e.g. ${allowedMimeTypes.join(
                  ', ',
                )}`,
            ),
            null,
          );
        }

        if (maxSize && file.size > maxSize) {
          return callback(
            new BadRequestException(
              validation?.customMessage?.maxSize ||
                `File size too large, please upload a file with a maximum size of ${maxSize} bytes`,
            ),
            null,
          );
        }

        // Remove File if Error
        req.on('error', () => {
          StorageHelpers.deleteFile(
            `./public/uploads/${path}/${randomName}${file.originalname}`,
          );

          console.log('UploadModule Error: File Removed');
        });

        return callback(null, `${randomName}${file.originalname}`);
      },
    }),
  }); // Return an empty object
};

export default UploadModule;
