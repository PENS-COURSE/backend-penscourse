import { Injectable, ParseFilePipe, PipeTransform } from '@nestjs/common';

@Injectable()
export class ImageMultipleValidationPipe
  implements PipeTransform<Express.Multer.File[]>
{
  constructor(private readonly pipe: ParseFilePipe) {}

  async transform(
    files: Express.Multer.File[] | { [key: string]: Express.Multer.File },
  ) {
    if (typeof files === 'object') {
      files = Object.values(files);
    }

    for (const file of files) {
      await this.pipe.transform(file);
    }

    const object = {};

    await Promise.all(
      files.map(async (file: any) => {
        object[file[0].fieldname] = file;
      }),
    );

    return object;
  }
}
