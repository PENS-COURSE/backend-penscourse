import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { NotificationsService } from '../../../notifications/notifications.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { StringHelper } from '../../../utils/slug.utils';
import {
  NotificationType,
  notificationWording,
} from '../../../utils/wording.utils';
import { CurriculumsService } from '../curriculums.service';
import { AddFileContentDto } from './dto/add-file-content.dto';
import { AddLiveClassDto } from './dto/add-live-class-content.dto';
import { AddVideoContentDto } from './dto/add-video-content.dto';
import { UpdateFileContentDto } from './dto/update-file-content.dto';
import { UpdateLiveClassDto } from './dto/update-live-class.dto';
import { UpdateVideoContentDto } from './dto/update-video-content.dto';

@Injectable()
export class SubjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly curriculumService: CurriculumsService,
    private readonly notificationService: NotificationsService,
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

    const data = await this.prisma.fileContent.create({
      data: {
        title,
        description,
        curriculum_id: curriculum.id,
        file_type: file.mimetype,
        url: file.path,
      },
    });

    if (data) {
      const course = await this.prisma.course.findFirst({
        where: {
          slug: course_slug,
        },
        include: {
          enrollments: true,
        },
      });

      const wording = notificationWording(NotificationType.course_new_file);

      await this.notificationService.sendNotification({
        user_ids: course.enrollments.map((enrollment) => enrollment.user_id),
        title: wording.title,
        body: wording.body,
        type: wording.type,
        action_id: course_slug,
      });
    }

    return data;
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

    const data = await this.prisma.videoContent.create({
      data: {
        title: title,
        url: video_url,
        duration: duration ?? undefined,
        description: description ?? undefined,
        curriculum_id: curriculum.id,
      },
    });

    if (data) {
      const course = await this.prisma.course.findFirst({
        where: {
          slug: course_slug,
        },
        include: {
          enrollments: true,
        },
      });

      const wording = notificationWording(NotificationType.course_new_video);

      await this.notificationService.sendNotification({
        user_ids: course.enrollments.map((enrollment) => enrollment.user_id),
        title: wording.title,
        body: wording.body,
        type: wording.type,
        action_id: course_slug,
      });
    }

    return data;
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
    const { title, description } = payload;

    const curriculum = await this.curriculumService.findOneByUUID(
      curriculum_uuid,
      course_slug,
    );

    const data = await this.prisma.liveClass.create({
      data: {
        title,
        description,
        slug: StringHelper.slug(title),
        curriculum_id: curriculum.id,
        is_open: false,
      },
    });

    if (data) {
      const course = await this.prisma.course.findFirst({
        where: {
          slug: course_slug,
        },
        include: {
          enrollments: true,
        },
      });

      const wording = notificationWording(
        NotificationType.course_new_live_class,
      );

      await this.notificationService.sendNotification({
        user_ids: course.enrollments.map((enrollment) => enrollment.user_id),
        title: wording.title,
        body: wording.body,
        type: wording.type,
        action_id: course_slug,
      });
    }

    return data;
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
        course: true,
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
        course_id: data.course.id,
        ...data.live_classes[0],
      };
    } else if (data.file_contents.length > 0) {
      return {
        type: 'file',
        course_id: data.course.id,
        ...data.file_contents[0],
      };
    } else if (data.video_contents.length > 0) {
      return {
        type: 'video',
        course_id: data.course.id,
        ...data.video_contents[0],
      };
    } else {
      throw new NotFoundException('Subject not found');
    }
  }

  async markSubjectCompletedBySubjectUUID({
    subject_uuid,
    curriculum_uuid,
    course_slug,
    user,
  }: {
    subject_uuid: string;
    curriculum_uuid: string;
    course_slug: string;
    user: User;
  }) {
    return await this.prisma.$transaction(async (prisma) => {
      const curriculum = await this.findOneByUUID({
        subject_uuid,
        curriculum_uuid,
        course_slug,
      });

      const getSubject = () => {
        switch (curriculum.type) {
          case 'file':
            return {
              file_content_id: curriculum.id,
            };
          case 'video':
            return {
              video_content_id: curriculum.id,
            };
          case 'live_class':
            return {
              live_class_id: curriculum.id,
            };
        }
      };

      const checkSubjectCompletion = await prisma.subjectCompletion.findFirst({
        where: {
          ...getSubject(),
        },
      });

      if (checkSubjectCompletion) {
        return checkSubjectCompletion;
      }

      return await prisma.subjectCompletion.create({
        data: {
          ...getSubject(),
          user_id: user.id,
          course_id: curriculum.course_id,
        },
      });
    });
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
    const { title, description } = payload;

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
      },
    });
  }

  async removeSubjectByUUID({
    subject_uuid,
    curriculum_uuid,
    course_slug,
  }: {
    subject_uuid: string;
    curriculum_uuid: string;
    course_slug: string;
  }) {
    const subject = await this.findOneByUUID({
      course_slug,
      curriculum_uuid,
      subject_uuid,
    });

    if (subject.type === 'file') {
      return await this.prisma.fileContent.delete({
        where: {
          id: subject.id,
        },
      });
    } else if (subject.type === 'video') {
      return await this.prisma.videoContent.delete({
        where: {
          id: subject.id,
        },
      });
    } else if (subject.type === 'live_class') {
      return await this.prisma.liveClass.delete({
        where: {
          id: subject.id,
        },
      });
    }
  }
}
