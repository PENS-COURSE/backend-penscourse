import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from '../../../authentication/decorators/current-user.decorators';
import { AddFileContentDto } from './dto/add-file-content.dto';
import { AddLiveClassDto } from './dto/add-live-class-content.dto';
import { AddVideoContentDto } from './dto/add-video-content.dto';
import { UpdateFileContentDto } from './dto/update-file-content.dto';
import { UpdateLiveClassDto } from './dto/update-live-class.dto';
import { UpdateVideoContentDto } from './dto/update-video-content.dto';
import { SubjectsService } from './subjects.service';

@ApiTags('Curriculum Subjects')
@ApiBearerAuth()
@Controller('courses')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @ApiOperation({ summary: 'Mark Completed Subject' })
  @ApiParam({
    name: 'curriculum_uuid',
    required: true,
    type: 'string',
    description: 'Curriculum UUID',
  })
  @ApiParam({
    name: 'course_slug',
    required: true,
    type: 'string',
    description: 'Course Slug',
  })
  @ApiParam({
    name: 'subject_uuid',
    required: true,
    type: 'string',
    description: 'Subject UUID',
  })
  @ApiOkResponse()
  @HttpCode(200)
  @Get(
    ':course_slug/curriculums/:curriculum_uuid/subjects/:subject_uuid/mark-completed',
  )
  async markSubjectCompletedBySubjectUUID(
    @Param('curriculum_uuid') curriculum_uuid: string,
    @Param('course_slug') course_slug: string,
    @Param('subject_uuid') subject_uuid: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.subjectsService.markSubjectCompletedBySubjectUUID({
      course_slug,
      curriculum_uuid,
      subject_uuid,
      user,
    });

    return {
      message: 'Successfully marked subject as completed',
      data,
    };
  }

  @ApiOperation({ summary: 'Add File Content' })
  @ApiParam({
    name: 'curriculum_uuid',
    required: true,
    type: 'string',
    description: 'Curriculum UUID',
  })
  @ApiParam({
    name: 'course_slug',
    required: true,
    type: 'string',
    description: 'Course Slug',
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse()
  @Post(':course_slug/curriculums/:curriculum_uuid/subjects/file-content/add')
  async addFileContent(
    @Body() payload: AddFileContentDto,
    @UploadedFile() file: Express.Multer.File,
    @Param('curriculum_uuid') curriculum_uuid: string,
    @Param('course_slug') course_slug: string,
  ) {
    const data = await this.subjectsService.addFileContent({
      payload,
      file,
      curriculum_uuid,
      course_slug,
    });

    return {
      message: 'Successfully added file content',
      data,
    };
  }

  @ApiOperation({ summary: 'Add Video Content' })
  @ApiParam({
    name: 'curriculum_uuid',
    required: true,
    type: 'string',
    description: 'Curriculum UUID',
  })
  @ApiParam({
    name: 'course_slug',
    required: true,
    type: 'string',
    description: 'Course Slug',
  })
  @ApiCreatedResponse()
  @Post(':course_slug/curriculums/:curriculum_uuid/subjects/video-content/add')
  async addVideoContent(
    @Body() payload: AddVideoContentDto,
    @Param('curriculum_uuid') curriculum_uuid: string,
    @Param('course_slug') course_slug: string,
  ) {
    const data = await this.subjectsService.addVideoContent({
      payload,
      curriculum_uuid,
      course_slug,
    });

    return {
      message: 'Successfully added video content',
      data,
    };
  }

  @ApiOperation({ summary: 'Add Live Class' })
  @ApiParam({
    name: 'curriculum_uuid',
    required: true,
    type: 'string',
    description: 'Curriculum UUID',
  })
  @ApiParam({
    name: 'course_slug',
    required: true,
    type: 'string',
    description: 'Course Slug',
  })
  @ApiCreatedResponse()
  @Post(':course_slug/curriculums/:curriculum_uuid/subjects/live-class/add')
  async addLiveClass(
    @Body() payload: AddLiveClassDto,
    @Param('curriculum_uuid') curriculum_uuid: string,
    @Param('course_slug') course_slug: string,
  ) {
    const data = await this.subjectsService.addLiveClass({
      payload,
      curriculum_uuid,
      course_slug,
    });

    return {
      message: 'Successfully added live class',
      data,
    };
  }

  @ApiOperation({ summary: 'Subject Find By UUID' })
  @ApiParam({
    name: 'curriculum_uuid',
    required: true,
    type: 'string',
    description: 'Curriculum UUID',
  })
  @ApiParam({
    name: 'course_slug',
    required: true,
    type: 'string',
    description: 'Course Slug',
  })
  @ApiParam({
    name: 'subject_uuid',
    required: true,
    type: 'string',
    description: 'Subject UUID',
  })
  @ApiOkResponse()
  @HttpCode(200)
  @Get(':course_slug/curriculums/:curriculum_uuid/subjects/:subject_uuid')
  async findSubjectByUUID(
    @Param('curriculum_uuid') curriculum_uuid: string,
    @Param('course_slug') course_slug: string,
    @Param('subject_uuid') subject_uuid: string,
  ) {
    const data = await this.subjectsService.findOneByUUID({
      subject_uuid,
      curriculum_uuid,
      course_slug,
    });

    return {
      message: 'Successfully fetched subject',
      data,
    };
  }

  @ApiOperation({ summary: 'Update File Content' })
  @ApiParam({
    name: 'curriculum_uuid',
    required: true,
    type: 'string',
    description: 'Curriculum UUID',
  })
  @ApiParam({
    name: 'course_slug',
    required: true,
    type: 'string',
    description: 'Course Slug',
  })
  @ApiParam({
    name: 'subject_uuid',
    required: true,
    type: 'string',
    description: 'Subject UUID',
  })
  @ApiOkResponse()
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @Patch(
    ':course_slug/curriculums/:curriculum_uuid/subjects/:subject_uuid/file-content/update',
  )
  async updateFileContent(
    @Body() payload: UpdateFileContentDto,
    @UploadedFile() file: Express.Multer.File,
    @Param('curriculum_uuid') curriculum_uuid: string,
    @Param('course_slug') course_slug: string,
    @Param('subject_uuid') subject_uuid: string,
  ) {
    const data = await this.subjectsService.updateFileContent({
      payload,
      file,
      subject_uuid,
      curriculum_uuid,
      course_slug,
    });

    return {
      message: 'Successfully updated file content',
      data,
    };
  }

  @ApiOperation({ summary: 'Update Video Content' })
  @ApiParam({
    name: 'curriculum_uuid',
    required: true,
    type: 'string',
    description: 'Curriculum UUID',
  })
  @ApiParam({
    name: 'course_slug',
    required: true,
    type: 'string',
    description: 'Course Slug',
  })
  @ApiParam({
    name: 'subject_uuid',
    required: true,
    type: 'string',
    description: 'Subject UUID',
  })
  @ApiOkResponse()
  @HttpCode(200)
  @Patch(
    ':course_slug/curriculums/:curriculum_uuid/subjects/:subject_uuid/video-content/update',
  )
  async updateVideoContent(
    @Body() payload: UpdateVideoContentDto,
    @Param('curriculum_uuid') curriculum_uuid: string,
    @Param('course_slug') course_slug: string,
    @Param('subject_uuid') subject_uuid: string,
  ) {
    const data = await this.subjectsService.updateVideoContent({
      payload,
      subject_uuid,
      curriculum_uuid,
      course_slug,
    });

    return {
      message: 'Successfully updated video content',
      data,
    };
  }

  @ApiOperation({ summary: 'Update Live Class' })
  @ApiParam({
    name: 'curriculum_uuid',
    required: true,
    type: 'string',
    description: 'Curriculum UUID',
  })
  @ApiParam({
    name: 'course_slug',
    required: true,
    type: 'string',
    description: 'Course Slug',
  })
  @ApiParam({
    name: 'subject_uuid',
    required: true,
    type: 'string',
    description: 'Subject UUID',
  })
  @ApiOkResponse()
  @HttpCode(200)
  @Patch(
    ':course_slug/curriculums/:curriculum_uuid/subjects/:subject_uuid/live-class/update',
  )
  async updateLiveClass(
    @Body() payload: UpdateLiveClassDto,
    @Param('curriculum_uuid') curriculum_uuid: string,
    @Param('course_slug') course_slug: string,
    @Param('subject_uuid') subject_uuid: string,
  ) {
    const data = await this.subjectsService.updateLiveClass({
      payload,
      subject_uuid,
      curriculum_uuid,
      course_slug,
    });

    return {
      message: 'Successfully updated live class',
      data,
    };
  }
}
