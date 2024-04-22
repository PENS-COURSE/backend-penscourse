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
  slug: string;
  recording_url: string;

  id: string;
  title: string;
  description: string;
  curriculum_id: string;
  is_open: boolean;
  created_at: Date;
  updated_at: Date;
}
