import * as fs from 'fs';
import { ValidationHelpers } from './validation.utils';

export class StorageHelpers {
  static deleteFile(path: string) {
    if (ValidationHelpers.isURL(path)) return;

    fs.open(path, (err) => {
      if (err) {
        console.error(err);
      } else {
        fs.unlink(path, (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log('File deleted successfully');
          }
        });
      }
    });
  }
}
