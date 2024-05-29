import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../authentication/decorators/current-user.decorators';
import { AllowUnauthorizedRequest } from '../../authentication/metadata/allow-unauthorized-request.decorator';
import { Auth } from '../../utils/decorators/auth.decorator';
import { ReviewsDto } from './reviews.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('Course - Reviews')
@Controller('courses')
export class ReviewsController {
  constructor(private reviewService: ReviewsService) {}

  @AllowUnauthorizedRequest()
  @ApiOperation({ summary: 'Get Reviews by Course Slug' })
  @ApiOkResponse()
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    example: 10,
  })
  @Get(':course_slug/reviews')
  async getReviewsByCourseSlug(
    @Param('course_slug') courseSlug: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    const data = await this.reviewService.getReviewsByCourseSlug({
      course_slug: courseSlug,
      page,
      limit,
    });

    return {
      message: 'Reviews berhasil ditemukan',
      data,
    };
  }

  @Auth('user')
  @ApiOperation({ summary: 'Create Review' })
  @ApiCreatedResponse()
  @Post(':course_slug/reviews/add-review')
  async createReview(
    @Param('course_slug') courseSlug: string,
    @CurrentUser() user: any,
    @Body() payload: ReviewsDto,
  ) {
    const data = await this.reviewService.createReview({
      course_slug: courseSlug,
      user,
      payload,
    });

    return {
      message: 'Review berhasil dibuat',
      data,
    };
  }

  @Auth('admin', 'dosen')
  @ApiOperation({ summary: 'Delete Review' })
  @ApiOkResponse()
  @Delete('reviews/:review_id/remove')
  async deleteReview(@Param('review_id') reviewId: number) {
    const data = await this.reviewService.deleteReview({ reviewId });

    return {
      message: 'Review berhasil dihapus',
      data,
    };
  }

  @AllowUnauthorizedRequest()
  @ApiOperation({ summary: 'Get Review By ID' })
  @ApiOkResponse()
  @Get('reviews/:review_id')
  async getReviewById(@Param('review_id') reviewId: number) {
    const data = await this.reviewService.getReviewById({ reviewId });

    return {
      message: 'Review berhasil ditemukan',
      data,
    };
  }
}
