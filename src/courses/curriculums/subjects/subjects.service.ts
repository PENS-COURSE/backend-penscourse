import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CurriculumsService } from '../curriculums.service';
import { AddFileContentDto } from './dto/add-file-content.dto';
import { AddLiveClassDto } from './dto/add-live-class-content.dto';
import { AddVideoContentDto } from './dto/add-video-content.dto';

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
}
