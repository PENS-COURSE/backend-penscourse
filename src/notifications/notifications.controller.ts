import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../authentication/decorators/current-user.decorators';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: 'Get all notifications' })
  @ApiOkResponse()
  @HttpCode(200)
  @Get()
  async findAll(@CurrentUser() user: any) {
    const data = await this.notificationsService.findAll({ user });

    return {
      message: 'Berhasil mendapatkan notifikasi',
      data,
    };
  }

  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiOkResponse()
  @HttpCode(200)
  @Get(':notification_uuid/mark-as-read')
  async markAsRead(
    @CurrentUser() user: any,
    @Param('notification_uuid') notification_uuid: string,
  ) {
    const data = await this.notificationsService.markAsRead({
      user,
      notification_uuid,
    });

    return {
      message: 'Berhasil menandai notifikasi sebagai sudah dibaca',
      data,
    };
  }

  @ApiOperation({ summary: 'Mark all notification as read' })
  @ApiOkResponse()
  @HttpCode(200)
  @Get('mark-as-read-all')
  async markAsReadAll(@CurrentUser() user: any) {
    const data = await this.notificationsService.markAllAsRead({
      user,
    });

    return {
      message: 'Berhasil menandai notifikasi sebagai sudah dibaca',
      data,
    };
  }

  @ApiOperation({ summary: 'Get one notification' })
  @ApiOkResponse()
  @HttpCode(200)
  @Get(':notification_uuid')
  async findOne(
    @CurrentUser() user: any,
    @Param('notification_uuid') notification_uuid: string,
  ) {
    const data = await this.notificationsService.findOne({
      user,
      notification_uuid,
    });

    return {
      message: 'Berhasil mendapatkan notifikasi',
      data,
    };
  }
}
