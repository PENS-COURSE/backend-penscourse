import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from '../utils/decorators/auth.decorator';
import { CourseDiscountService } from './course-discount.service';
import { CreateCourseDiscountDto } from './dto/create-course-discount.dto';

@ApiBearerAuth()
@ApiTags('Course Discounts')
@Controller('course-discounts')
export class CourseDiscountController {
  constructor(private readonly courseDiscountService: CourseDiscountService) {}

  @Auth('admin', 'dosen')
  @HttpCode(201)
  @ApiCreatedResponse()
  @Post('create')
  async createCourseDiscount(@Body() payload: CreateCourseDiscountDto) {
    const data = await this.courseDiscountService.createCourseDiscount(payload);

    return {
      message: 'Successfully created a course discount.',
      data,
    };
  }

  @Auth('admin', 'dosen')
  @HttpCode(200)
  @ApiOkResponse()
  @ApiQuery({
    name: 'page',
    description: 'Page Number',
    required: false,
  })
  @Get()
  async findAll(@Query('page') page: number) {
    const data = await this.courseDiscountService.findAll({ page });

    return {
      message: 'Successfully retrieved all course discounts.',
      data,
    };
  }

  @Auth('admin', 'dosen')
  @HttpCode(200)
  @ApiOkResponse()
  @ApiParam({
    name: 'courseSlug',
    description: 'Slug of the course',
    required: true,
  })
  @Get(':courseSlug')
  async findOne(@Param('courseSlug') courseSlug: string) {
    const data = await this.courseDiscountService.findOne(courseSlug);

    return {
      message: 'Successfully retrieved a course discount.',
      data,
    };
  }

  @Auth('admin', 'dosen')
  @HttpCode(200)
  @ApiOkResponse()
  @ApiParam({
    name: 'courseSlug',
    description: 'Slug of the course',
    required: true,
  })
  @Patch(':courseSlug/update')
  async update(
    @Param('courseSlug') courseSlug: string,
    @Body() payload: CreateCourseDiscountDto,
  ) {
    const data = await this.courseDiscountService.update(courseSlug, payload);

    return {
      message: 'Successfully updated a course discount.',
      data,
    };
  }

  @Auth('admin', 'dosen')
  @HttpCode(200)
  @ApiOkResponse()
  @ApiParam({
    name: 'courseSlug',
    description: 'Slug of the course',
    required: true,
  })
  @Delete(':courseSlug/delete')
  async remove(@Param('courseSlug') courseSlug: string) {
    const data = await this.courseDiscountService.remove(courseSlug);

    return {
      message: 'Successfully deleted a course discount.',
      data,
    };
  }
}
