import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurriculumsService } from './curriculums.service';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';

@ApiTags('Course - Curriculums')
@Controller('courses')
export class CurriculumsController {
  constructor(private readonly curriculumsService: CurriculumsService) {}

  @ApiOperation({ summary: 'Create Curriculums' })
  @ApiParam({
    name: 'slug',
    required: true,
    type: 'string',
    description: 'Course Slug',
  })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  @HttpCode(201)
  @Post(':slug/curriculums/create')
  async create(
    @Body() payload: CreateCurriculumDto,
    @Param('slug') slug: string,
  ) {
    const data = await this.curriculumsService.create(payload, slug);

    return {
      message: 'Successfully created a new curriculum',
      data,
    };
  }

  @ApiOperation({ summary: 'Find All Curriculums With Subjects' })
  @ApiParam({
    name: 'slug',
    required: true,
    type: 'string',
    description: 'Course Slug',
  })
  @ApiBearerAuth()
  @ApiOkResponse()
  @HttpCode(200)
  @Get(':slug/curriculums')
  async findAll(@Param('slug') slug: string) {
    const data = await this.curriculumsService.findAllWithSubjects({
      slugCourse: slug,
    });

    return {
      message: 'Successfully retrieved all curriculums',
      data,
    };
  }

  @ApiOperation({ summary: 'Find One Curriculum by UUID' })
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
  @ApiBearerAuth()
  @ApiOkResponse()
  @HttpCode(200)
  @Get(':slug/curriculums/:uuid')
  async findOneByUUID(
    @Param('uuid') uuid: string,
    @Param('slug') slug: string,
  ) {
    const data = await this.curriculumsService.findOneByUUID(uuid, slug);

    return {
      message: 'Successfully retrieved curriculum',
      data,
    };
  }

  @ApiOperation({ summary: 'Update Curriculum by UUID' })
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
  @ApiBearerAuth()
  @ApiOkResponse()
  @HttpCode(200)
  @Patch(':slug/curriculums/:uuid/update')
  async update(
    @Param('uuid') uuid: string,
    @Body() payload: UpdateCurriculumDto,
    @Param('slug') slug: string,
  ) {
    const data = await this.curriculumsService.update(uuid, slug, payload);

    return {
      message: 'Successfully updated curriculum',
      data,
    };
  }

  @ApiOperation({ summary: 'Remove Curriculum by UUID' })
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
  @ApiBearerAuth()
  @ApiOkResponse()
  @HttpCode(200)
  @Get(':slug/curriculums/:uuid')
  async remove(@Param('uuid') uuid: string, @Param('slug') slug: string) {
    const data = await this.curriculumsService.remove(uuid, slug);

    return {
      message: 'Successfully removed curriculum',
      data,
    };
  }
}
