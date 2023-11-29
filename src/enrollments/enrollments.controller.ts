import {
  Controller,
  Get,
  HttpCode,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../authentication/decorators/current-user.decorators';
import { Roles } from '../utils/decorators/roles.decorator';
import { HasEnrolledGuard } from '../utils/guards/has-enrolled.guard';
import { EnrollmentsService } from './enrollments.service';

@ApiTags('Enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Roles(['user'])
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Get all enrollments' })
  @ApiOkResponse()
  @Get('')
  async findAll(@CurrentUser() user: any, @Query('page') page: number) {
    const data = await this.enrollmentsService.findAll({ user, page });

    return {
      message: 'Successfully retrieved all enrollments',
      data,
    };
  }

  @Roles(['user'])
  @UseGuards(HasEnrolledGuard)
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
