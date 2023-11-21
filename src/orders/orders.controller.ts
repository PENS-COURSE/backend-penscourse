import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../authentication/decorators/current-user.decorators';
import { AllowUnauthorizedRequest } from '../authentication/metadata/allow-unauthorized-request.decorator';
import { OrderCourseDto } from './dto/order-course.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiBearerAuth()
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
  })
  @ApiOkResponse()
  @HttpCode(200)
  @ApiOperation({ summary: 'Find All Orders User' })
  @Get('')
  async findAll(@CurrentUser() user: any, @Query('page') page: number) {
    const data = await this.ordersService.findAll({ user, page });

    return {
      message: 'Successfully get all orders',
      data,
    };
  }

  @ApiBearerAuth()
  @ApiOkResponse()
  @HttpCode(200)
  @ApiOperation({ summary: 'Find By UUID Order User' })
  @ApiParam({
    name: 'uuid',
    type: String,
    required: true,
    description: 'Order UUID',
  })
  @Get(':uuid')
  async findOne(@CurrentUser() user: any, @Param('uuid') uuid: string) {
    const data = await this.ordersService.findOne({ user, orderId: uuid });

    return {
      message: 'Successfully get order',
      data,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Order Course' })
  @ApiParam({
    name: 'courseSlug',
    type: String,
    required: true,
    description: 'Course Slug',
  })
  @Post(':courseSlug/order')
  async orderCourse(
    @CurrentUser() user: any,
    @Param('courseSlug') courseSlug: string,
    @Body() payload: OrderCourseDto,
  ) {
    const data = await this.ordersService.orderCourse({
      user,
      courseSlug,
      payload,
    });

    return {
      message: 'Successfully order course',
      data,
    };
  }

  @ApiOperation({ summary: 'Notification Midtrans' })
  @AllowUnauthorizedRequest()
  @Post('notification-midtrans')
  async notificationMidtrans(@Body() payload: any) {
    return await this.ordersService.handleMidtransNotifications(payload);
  }
}
