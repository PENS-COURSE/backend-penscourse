import { FileValidator } from '@nestjs/common';
import { IFile } from '@nestjs/common/pipes/file/interfaces';

export interface CustomUploadTypeValidatorOptions {
  fileType: string[];
}

export class FileMimeValidator extends FileValidator<
  CustomUploadTypeValidatorOptions,
  IFile
> {
  private _allowedMimeTypes: string[];

  constructor(
    protected readonly validationOptions: CustomUploadTypeValidatorOptions,
  ) {
    super(validationOptions);
    this._allowedMimeTypes = this.validationOptions.fileType;
  }

  public isValid(file?: Express.Multer.File): boolean {
    if (!!file) {
      if ('mimetype' in file) {
        return this._allowedMimeTypes.includes(file.mimetype);
      }
    }

    return this._allowedMimeTypes.includes(file.mimetype);
  }

  public buildErrorMessage(): string {
    return `Upload not allowed. Upload only files of type: ${this._allowedMimeTypes.join(
      ', ',
    )}`;
  }
}
