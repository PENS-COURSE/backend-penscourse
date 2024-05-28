import { IsNotEmpty, IsString } from 'class-validator';

export class HandleCertificateCreationDto {
  @IsString()
  @IsNotEmpty()
  certificate_id: string;

  @IsString()
  @IsNotEmpty()
  file_pdf: string;

  @IsString()
  @IsNotEmpty()
  file_jpg: string;
}
