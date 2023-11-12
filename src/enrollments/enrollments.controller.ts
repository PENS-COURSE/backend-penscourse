import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../authentication/decorators/current-user.decorators';
import { EnrollmentsService } from './enrollments.service';

@ApiTags('Enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Get all enrollments' })
  @ApiOkResponse()
  @Get('')
  async findAll(@CurrentUser() user: any) {
    const data = await this.enrollmentsService.findAll({ user });

    return {
      message: 'Successfully retrieved all enrollments',
      data,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Progress Course By Slug' })
  @ApiParam({
    name: 'slug',
    required: true,
    type: 'string',
    description: 'Course Slug',
  })
  @ApiOkResponse()
  @HttpCode(200)
  @Get(':slug/progress')
  async getProgressCourseBySlug(
    @Param('slug') slug: string,
    @CurrentUser() user: any,
  ) {
    const data = await this.enrollmentsService.getProgressClass({ slug, user });

    return {
      message: 'Successfully retrieved progress course',
      data,
    };
  }
}
