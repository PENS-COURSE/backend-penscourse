import { PartialType } from '@nestjs/swagger/dist/type-helpers';
import { CreateCurriculumDto } from './create-curriculum.dto';

export class UpdateCurriculumDto extends PartialType(CreateCurriculumDto) {}
