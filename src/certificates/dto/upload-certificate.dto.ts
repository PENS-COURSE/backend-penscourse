import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class HandleCertificateCreationDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @IsNotEmpty()
  course_id: number;

  @IsString()
  @IsNotEmpty()
  file_pdf: string;

  @IsString()
  @IsNotEmpty()
  file_jpg: string;

  @IsString()
  @IsNotEmpty()
  certificate_type: 'presence' | 'competence';
}
