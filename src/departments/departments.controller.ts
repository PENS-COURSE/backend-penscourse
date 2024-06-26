import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from '../authentication/decorators/current-user.decorators';
import { AllowUnauthorizedRequest } from '../authentication/metadata/allow-unauthorized-request.decorator';
import { Auth } from '../utils/decorators/auth.decorator';
import { FileMimeValidator } from '../utils/validation/file-validator.pipe';
import { ImageMultipleValidationPipe } from '../utils/validation/image-multiple-validation.pipe';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@ApiTags('Departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Auth('admin', 'dosen')
  @ApiOperation({ summary: 'Create Department' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  @HttpCode(201)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'icon', maxCount: 1 },
      { name: 'participant_thumbnail', maxCount: 1 },
      { name: 'benefits_thumbnail', maxCount: 1 },
      { name: 'opportunities_thumbnail', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @Post('create')
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @UploadedFiles(
      new ImageMultipleValidationPipe(
        new ParseFilePipe({
          errorHttpStatusCode: 400,
          fileIsRequired: true,
          validators: [
            new MaxFileSizeValidator({
              maxSize: 1024 * 1024 * 2,
              message: (size) =>
                `File size too large. File size: ${size} bytes, max size: 2MB`,
            }),
            new FileMimeValidator({
              fileType: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
            }),
          ],
        }),
      ),
    )
    files: {
      icon?: Express.Multer.File[];
      participant_thumbnail?: Express.Multer.File[];
      benefits_thumbnail?: Express.Multer.File[];
      opportunities_thumbnail?: Express.Multer.File[];
    },
  ) {
    const data = await this.departmentsService.create({
      createDepartmentDto,
      file: files,
    });

    return {
      message: 'Successfully created department',
      data,
    };
  }

  @AllowUnauthorizedRequest()
  @ApiOperation({ summary: 'Find All Departments' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiOkResponse()
  @HttpCode(200)
  @Get()
  async findAll(@Query('page') page: number, @Query('name') name: string) {
    const data = await this.departmentsService.findAll({ page, name });

    return {
      message: 'Successfully retrieved departments',
      data,
    };
  }

  @ApiBearerAuth()
  @AllowUnauthorizedRequest()
  @ApiOperation({ summary: 'Get All Courses By Department Slug' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiOkResponse()
  @HttpCode(200)
  @Get(':slug/courses')
  async getCoursesByDepartmentSlug(
    @Param('slug') slug: string,
    @Query('page') page: number,
    @Query('name') name: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.departmentsService.getCoursesByDepartmentSlug({
      page,
      name,
      slug,
      user,
    });

    return {
      message: 'Successfully retrieved courses by department slug',
      data,
    };
  }

  @AllowUnauthorizedRequest()
  @ApiOperation({ summary: 'Find One Department' })
  @ApiOkResponse()
  @HttpCode(200)
  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const data = await this.departmentsService.findOneBySlug(slug);

    return {
      message: 'Successfully retrieved department',
      data,
    };
  }

  @Auth('admin', 'dosen')
  @ApiOperation({ summary: 'Update Department' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'icon', maxCount: 1 },
      { name: 'participant_thumbnail', maxCount: 1 },
      { name: 'benefits_thumbnail', maxCount: 1 },
      { name: 'opportunities_thumbnail', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @HttpCode(200)
  @Patch(':slug/update')
  async update(
    @Param('slug') slug: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @UploadedFiles(
      new ImageMultipleValidationPipe(
        new ParseFilePipe({
          errorHttpStatusCode: 400,
          validators: [
            new MaxFileSizeValidator({
              maxSize: 1024 * 1024 * 2,
              message: (size) =>
                `File size too large. File size: ${size} bytes, max size: 2MB`,
            }),
            new FileMimeValidator({
              fileType: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
            }),
          ],
        }),
      ),
    )
    files: {
      icon: Express.Multer.File[];
      participant_thumbnail: Express.Multer.File[];
      benefits_thumbnail: Express.Multer.File[];
      opportunities_thumbnail: Express.Multer.File[];
    },
  ) {
    const data = await this.departmentsService.update({
      slug,
      updateDepartmentDto,
      file: files,
    });

    return {
      message: 'Successfully updated department',
      data,
    };
  }

  @Auth('admin', 'dosen')
  @ApiOperation({ summary: 'Remove Department' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @HttpCode(200)
  @Delete(':slug/remove')
  async remove(@Param('slug') slug: string) {
    const data = await this.departmentsService.remove(slug);

    return {
      message: 'Successfully removed department',
      data,
    };
  }
}
