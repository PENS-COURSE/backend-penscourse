import { Body, Controller, Param, Post, UploadedFile } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AddFileContentDto } from './dto/add-file-content.dto';
import { AddLiveClassDto } from './dto/add-live-class-content.dto';
import { AddVideoContentDto } from './dto/add-video-content.dto';
import { SubjectsService } from './subjects.service';

@ApiTags('Curriculum Subjects')
@ApiBearerAuth()
@Controller('courses')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @ApiOperation({ summary: 'Add File Content' })
  @ApiParam({
    name: 'uuid',
    required: true,
    type: 'string',
    description: 'Curriculum UUID',
  })
  @ApiParam({
    name: 'slug',
    required: true,
    type: 'string',
    description: 'Course Slug',
  })
  @ApiCreatedResponse()
  @Post(':slug/curriculums/:uuid/subjects/file-content/add')
  async addFileContent(
    @Body() payload: AddFileContentDto,
    @UploadedFile() file,
    @Param('uuid') curriculum_uuid: string,
    @Param('slug') course_slug: string,
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
    name: 'uuid',
    required: true,
    type: 'string',
    description: 'Curriculum UUID',
  })
  @ApiParam({
    name: 'slug',
    required: true,
    type: 'string',
    description: 'Course Slug',
  })
  @ApiCreatedResponse()
  @Post(':slug/curriculums/:uuid/subjects/video-content/add')
  async addVideoContent(
    @Body() payload: AddVideoContentDto,
    @Param('uuid') curriculum_uuid: string,
    @Param('slug') course_slug: string,
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
    name: 'uuid',
    required: true,
    type: 'string',
    description: 'Curriculum UUID',
  })
  @ApiParam({
    name: 'slug',
    required: true,
    type: 'string',
    description: 'Course Slug',
  })
  @ApiCreatedResponse()
  @Post(':slug/curriculums/:uuid/subjects/live-class/add')
  async addLiveClass(
    @Body() payload: AddLiveClassDto,
    @Param('uuid') curriculum_uuid: string,
    @Param('slug') course_slug: string,
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
}
