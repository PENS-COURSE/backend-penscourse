import { FileContent, LiveClass, VideoContent } from '@prisma/client';

export class FileContentEntity implements FileContent {
  constructor(partial: Partial<FileContent>) {
    Object.assign(this, partial);
  }

  id: string;
  title: string;
  description: string;
  url: string;
  file_type: string;
  curriculum_id: string;
  created_at: Date;
  updated_at: Date;
}

export class VideoContentEntity implements VideoContent {
  constructor(partial: Partial<VideoContentEntity>) {
    Object.assign(this, partial);
  }

  id: string;
  title: string;
  description: string;
  url: string;
  duration: string;
  curriculum_id: string;
  created_at: Date;
  updated_at: Date;
}

export class LiveClassEntity implements LiveClass {
  constructor(partial: Partial<LiveClassEntity>) {
    Object.assign(this, partial);
  }

  id: string;
  title: string;
  description: string;
  url: string;
  curriculum_id: string;
  start_date: Date;
  end_date: Date;
  is_open: boolean;
  created_at: Date;
  updated_at: Date;
}
