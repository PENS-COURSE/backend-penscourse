import * as fs from 'fs';
import { join } from 'path';
import { ValidationHelpers } from './validation.utils';

export class StorageHelpers {
  static deleteFile(path: string) {
    if (ValidationHelpers.isURL(path)) return;

    fs.open(join(process.cwd(), path), (err) => {
      if (err) {
        console.error(err);
      } else {
        fs.unlink(join(process.cwd(), path), (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log('File deleted successfully');
          }
        });
      }
    });
  }

  static async renameFile({
    oldPath,
    newPath,
    canChangeExtension = true,
  }: {
    oldPath: string;
    newPath: string;
    canChangeExtension?: boolean;
  }) {
    // Get Extension
    const ext = oldPath.split('.').pop();

    if (canChangeExtension) {
      return await new Promise<string>((resolve, reject) => {
        fs.rename(
          join(process.cwd(), oldPath),
          join(process.cwd(), newPath),
          (err) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              console.log('File renamed successfully');
              resolve(newPath);
            }
          },
        );
      });
    } else {
      return await new Promise<string>((resolve, reject) => {
        fs.rename(
          join(process.cwd(), oldPath),
          `${join(process.cwd(), newPath)}.${ext}`,
          (err) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              console.log('File renamed successfully');
              resolve(`${newPath}.${ext}`);
            }
          },
        );
      });
    }
  }

  static checkFileExists(path: string): boolean {
    if (fs.existsSync(join(process.cwd(), path))) {
      return true;
    } else {
      return false;
    }
  }
}
