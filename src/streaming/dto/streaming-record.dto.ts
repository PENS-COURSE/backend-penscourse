import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StreamingRecordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  video_track_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  audio_track_id: string;
}
