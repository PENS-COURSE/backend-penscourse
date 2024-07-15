import {
  $Enums,
  FileContent,
  LiveClass,
  User,
  VideoContent,
} from '@prisma/client';

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
  constructor(
    partial: Partial<LiveClassEntity>,
    user?: User,
    isDosenRoom?: boolean,
  ) {
    Object.assign(this, partial);

    if (user) {
      const isDosen = user.role === 'dosen' && isDosenRoom;
      const isAdmin = user.role === 'admin';
      const isUserOpen = user.role === 'user' && this.is_open;

      this.is_open = isDosen || isAdmin || isUserOpen;
    }
  }
  status: $Enums.StatusLiveClass;

  id: string;
  slug: string;
  recording_url: string;
  title: string;
  description: string;
  curriculum_id: string;
  is_open: boolean;
  room_moderator_id: number;
  created_at: Date;
  updated_at: Date;
}
