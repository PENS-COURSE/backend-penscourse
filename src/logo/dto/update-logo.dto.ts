import { PartialType } from '@nestjs/swagger';
import { CreateLogoDto } from './create-logo.dto';

export class UpdateLogoDto extends PartialType(CreateLogoDto) {}
