import {
  Body,
  Controller,
  Delete,
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
import { CurrentUser } from '../../authentication/decorators/current-user.decorators';
import { AllowUnauthorizedRequest } from '../../authentication/metadata/allow-unauthorized-request.decorator';
import { Auth } from '../../utils/decorators/auth.decorator';
import { CurriculumsService } from './curriculums.service';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';

// TODO: Check User is Teacher & Course is handled by Teacher

@ApiTags('Course - Curriculums')
@Controller('courses')
export class CurriculumsController {
  constructor(private readonly curriculumsService: CurriculumsService) {}

  @Auth('admin', 'dosen')
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

  @ApiOperation({
    summary: 'Find All Curriculums With Subjects ( OPTIONAL AUTH )',
  })
  @AllowUnauthorizedRequest()
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
  async findAll(@Param('slug') slug: string, @CurrentUser() user: any) {
    const data = await this.curriculumsService.findAllWithSubjects({
      slugCourse: slug,
      user,
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

  @Auth('admin', 'dosen')
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

  @Auth('admin', 'dosen')
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
  @Delete(':slug/curriculums/:uuid')
  async remove(@Param('uuid') uuid: string, @Param('slug') slug: string) {
    const data = await this.curriculumsService.remove(uuid, slug);

    return {
      message: 'Successfully removed curriculum',
      data,
    };
  }
}
