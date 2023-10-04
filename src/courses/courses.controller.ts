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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AllowUnauthorizedRequest } from '../authentication/metadata/allow-unauthorized-request.decorator';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @ApiOperation({ summary: 'Create Courses' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('thumbnail'))
  @ApiConsumes('multipart/form-data')
  @Post('create')
  async create(
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
    const data = await this.coursesService.create(createCourseDto, thumbnail);

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

  @AllowUnauthorizedRequest()
  @ApiOperation({ summary: 'Get Course By Slug' })
  @ApiOkResponse()
  @HttpCode(200)
  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const data = await this.coursesService.findOneBySlug(slug);

    return {
      message: 'Successfully retrieved course',
      data,
    };
  }

  @ApiOperation({ summary: 'Update Course' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('thumbnail'))
  @ApiConsumes('multipart/form-data')
  @Patch(':slug/update')
  async update(
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
    const data = await this.coursesService.update(
      slug,
      updateCourseDto,
      thumbnail,
    );

    return {
      message: 'Successfully updated course',
      data,
    };
  }

  @ApiOperation({ summary: 'Remove Course' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @HttpCode(200)
  @Delete(':slug/remove')
  async remove(@Param('slug') slug: string) {
    const data = await this.coursesService.remove(slug);

    return {
      message: 'Successfully removed course',
      data,
    };
  }
}
