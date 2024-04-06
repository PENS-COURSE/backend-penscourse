import { ApiProperty } from '@nestjs/swagger';
import { Quiz } from '@prisma/client';

export class QuizEntity implements Quiz {
  @ApiProperty()
  id: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  duration: number;
  @ApiProperty()
  start_date: Date;
  @ApiProperty()
  end_date: Date;
  @ApiProperty()
  is_ended: boolean;
  @ApiProperty()
  is_active: boolean;
  @ApiProperty()
  show_result: boolean;
  @ApiProperty()
  pass_grade: number;
  @ApiProperty()
  curriculum_id: string;
  @ApiProperty()
  created_at: Date;
  @ApiProperty()
  updated_at: Date;

  constructor(data: Partial<QuizEntity>) {
    Object.assign(this, data);
  }
}
