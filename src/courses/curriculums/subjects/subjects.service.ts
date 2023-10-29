import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { StorageHelpers } from '../../../utils/storage.utils';
import { CurriculumsService } from '../curriculums.service';
import { AddFileContentDto } from './dto/add-file-content.dto';
import { AddLiveClassDto } from './dto/add-live-class-content.dto';
import { AddVideoContentDto } from './dto/add-video-content.dto';
import { UpdateFileContentDto } from './dto/update-file-content.dto';
import { UpdateLiveClassDto } from './dto/update-live-class.dto';
import { UpdateVideoContentDto } from './dto/update-video-content.dto';

// TODO: Update & Delete Content
// TODO: Send Notification to all students when live class is open
// TODO: Send Notification to all students when new file, video, live class is added
// TODO: Update Course to Completed when all curriculums are completed
// TODO: Generate Certificate when course is completed
// TODO: Send Certificate to all students when course is completed (Email, Download)

@Injectable()
export class SubjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly curriculumService: CurriculumsService,
  ) {}

  async addFileContent({
    payload,
    file,
    curriculum_uuid,
    course_slug,
  }: {
    payload: AddFileContentDto;
    file: Express.Multer.File;
    curriculum_uuid: string;
    course_slug: string;
  }) {
    const { title, description } = payload;

    const curriculum = await this.curriculumService.findOneByUUID(
      curriculum_uuid,
      course_slug,
    );

    return await this.prisma.fileContent.create({
      data: {
        title,
        description,
        curriculum_id: curriculum.id,
        file_type: file.mimetype,
        url: file.path,
      },
    });
  }

  async addVideoContent({
    payload,
    curriculum_uuid,
    course_slug,
  }: {
    payload: AddVideoContentDto;
    curriculum_uuid: string;
    course_slug: string;
  }) {
    const { title, description, duration, video_url } = payload;

    const curriculum = await this.curriculumService.findOneByUUID(
      curriculum_uuid,
      course_slug,
    );

    return await this.prisma.videoContent.create({
      data: {
        title: title,
        url: video_url,
        duration: duration ?? undefined,
        description: description ?? undefined,
        curriculum_id: curriculum.id,
      },
    });
  }

  async addLiveClass({
    payload,
    curriculum_uuid,
    course_slug,
  }: {
    payload: AddLiveClassDto;
    curriculum_uuid: string;
    course_slug: string;
  }) {
    const { title, description, meet_url, start_date, end_date } = payload;

    const curriculum = await this.curriculumService.findOneByUUID(
      curriculum_uuid,
      course_slug,
    );

    return await this.prisma.liveClass.create({
      data: {
        title,
        description,
        url: meet_url,
        start_date: start_date ?? undefined,
        end_date: end_date ?? undefined,
        curriculum_id: curriculum.id,
        is_open: false,
      },
    });
  }

  async findOneByUUID({
    subject_uuid,
    curriculum_uuid,
    course_slug,
    throwException = true,
  }: {
    subject_uuid: string;
    curriculum_uuid: string;
    course_slug: string;
    throwException?: boolean;
  }) {
    const curriculum = await this.curriculumService.findOneByUUID(
      curriculum_uuid,
      course_slug,
    );

    const data = await this.prisma.curriculum.findFirst({
      where: {
        id: curriculum.id,
      },
      include: {
        live_classes: {
          where: {
            id: subject_uuid,
          },
        },
        file_contents: {
          where: {
            id: subject_uuid,
          },
        },
        video_contents: {
          where: {
            id: subject_uuid,
          },
        },
      },
    });

    if (!data && throwException) {
      throw new NotFoundException('Subject not found');
    }

    if (data.live_classes.length > 0) {
      return {
        type: 'live_class',
        ...data.live_classes[0],
      };
    } else if (data.file_contents.length > 0) {
      return {
        type: 'file',
        ...data.file_contents[0],
      };
    } else if (data.video_contents.length > 0) {
      return {
        type: 'video',
        ...data.video_contents[0],
      };
    }
  }

  async updateFileContent({
    payload,
    file,
    subject_uuid,
    curriculum_uuid,
    course_slug,
  }: {
    payload: UpdateFileContentDto;
    file: Express.Multer.File;
    subject_uuid: string;
    curriculum_uuid: string;
    course_slug: string;
  }) {
    const { title, description } = payload;

    const subject = await this.findOneByUUID({
      course_slug,
      curriculum_uuid,
      subject_uuid,
    });

    if (subject.type !== 'file') {
      throw new NotFoundException('File not found');
    }

    if (subject.url) {
      StorageHelpers.deleteFile(subject.url);
    }

    return await this.prisma.fileContent.update({
      where: {
        id: subject.id,
      },
      data: {
        title,
        description,
        file_type: file.mimetype,
        url: file.path,
      },
    });
  }

  async updateVideoContent({
    payload,
    subject_uuid,
    curriculum_uuid,
    course_slug,
  }: {
    payload: UpdateVideoContentDto;
    subject_uuid: string;
    curriculum_uuid: string;
    course_slug: string;
  }) {
    const { title, description, duration, video_url } = payload;

    const subject = await this.findOneByUUID({
      course_slug,
      curriculum_uuid,
      subject_uuid,
    });

    if (subject.type !== 'video') {
      throw new NotFoundException('Video not found');
    }

    return await this.prisma.videoContent.update({
      where: {
        id: subject.id,
      },
      data: {
        title,
        description,
        url: video_url,
        duration: duration ?? undefined,
      },
    });
  }

  async updateLiveClass({
    payload,
    subject_uuid,
    curriculum_uuid,
    course_slug,
  }: {
    payload: UpdateLiveClassDto;
    subject_uuid: string;
    curriculum_uuid: string;
    course_slug: string;
  }) {
    const { title, description, start_date, meet_url, end_date } = payload;

    const subject = await this.findOneByUUID({
      course_slug,
      curriculum_uuid,
      subject_uuid,
    });

    if (subject.type !== 'video') {
      throw new NotFoundException('Video not found');
    }

    return await this.prisma.liveClass.update({
      where: {
        id: subject.id,
      },
      data: {
        title,
        description,
        url: meet_url,
        start_date: start_date ?? undefined,
        end_date: end_date ?? undefined,
      },
    });
  }
}
