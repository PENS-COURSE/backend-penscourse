import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Query,
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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from '../authentication/decorators/current-user.decorators';
import { AllowUnauthorizedRequest } from '../authentication/metadata/allow-unauthorized-request.decorator';
import { Auth } from '../utils/decorators/auth.decorator';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Auth('admin', 'dosen')
  @ApiOperation({ summary: 'Create Courses' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('thumbnail'))
  @ApiConsumes('multipart/form-data')
  @Post('create')
  async create(
    @CurrentUser() user: any,
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'image',
        })
        .addMaxSizeValidator({
          maxSize: 2 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: 400,
          fileIsRequired: false,
        }),
    )
    thumbnail: Express.Multer.File,
  ) {
    const data = await this.coursesService.create({
      user,
      createCourseDto,
      thumbnail,
    });

    return {
      message: 'Successfully created course',
      data,
    };
  }

  @AllowUnauthorizedRequest()
  @ApiOperation({ summary: 'Find All Courses' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiOkResponse()
  @HttpCode(200)
  @Get()
  async findAll(@Query('page') page: number, @Query('name') name: string) {
    const data = await this.coursesService.findAll({ page, name });

    return {
      message: 'Successfully retrieved courses',
      data,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find All Courses' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiOkResponse()
  @HttpCode(200)
  @Get('auth')
  async findAllAuth(
    @Query('page') page: number,
    @Query('name') name: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.coursesService.findAll({ page, name, user });

    return {
      message: 'Successfully retrieved courses',
      data,
    };
  }

  @Auth('admin', 'dosen')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find All Course By Publisher (DOSEN / ADMIN)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiOkResponse()
  @HttpCode(200)
  @Get('admins')
  async findAllByDosen(
    @CurrentUser() user: any,
    @Query('page') page: number,
    @Query('name') name: string,
  ) {
    const data = await this.coursesService.findAll({
      page,
      name,
      user,
      onlyPublisher: true,
    });

    return {
      message: 'Successfully retrieved courses',
      data,
    };
  }

  @AllowUnauthorizedRequest()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Course By Slug' })
  @ApiParam({
    name: 'slug',
    required: true,
    type: 'string',
    description: 'Course Slug',
  })
  @ApiOkResponse()
  @HttpCode(200)
  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const data = await this.coursesService.findOneBySlug({ slug });

    return {
      message: 'Successfully retrieved course',
      data,
    };
  }

  @Auth('admin', 'dosen')
  @ApiOperation({ summary: 'Update Course' })
  @ApiParam({
    name: 'slug',
    required: true,
    type: 'string',
    description: 'Course Slug',
  })
  @ApiBearerAuth()
  @ApiOkResponse()
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('thumbnail'))
  @ApiConsumes('multipart/form-data')
  @Patch(':slug/update')
  async update(
    @CurrentUser() user: any,
    @Param('slug') slug: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'image',
        })
        .addMaxSizeValidator({
          maxSize: 2 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: 400,
          fileIsRequired: false,
        }),
    )
    thumbnail: Express.Multer.File,
  ) {
    const data = await this.coursesService.update({
      user,
      slug,
      updateCourseDto,
      thumbnail,
    });

    return {
      message: 'Successfully updated course',
      data,
    };
  }

  @Auth('admin', 'dosen')
  @ApiOperation({ summary: 'Remove Course' })
  @ApiParam({
    name: 'slug',
    required: true,
    type: 'string',
    description: 'Course Slug',
  })
  @ApiBearerAuth()
  @ApiOkResponse()
  @HttpCode(200)
  @Delete(':slug/remove')
  async remove(@Param('slug') slug: string, @CurrentUser() user: any) {
    const data = await this.coursesService.remove({ slug, user });

    return {
      message: 'Successfully removed course',
      data,
    };
  }

  @Auth('user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enroll Course Free' })
  @ApiParam({
    name: 'slug',
    required: true,
    type: 'string',
    description: 'Course Slug',
  })
  @HttpCode(201)
  @ApiCreatedResponse()
  @Post(':slug/enroll')
  async enrollCourse(@Param('slug') slug: string, @CurrentUser() user: any) {
    const data = await this.coursesService.enrollCourse({ slug, user });

    return {
      message: 'Successfully enrolled course',
      data,
    };
  }
}
