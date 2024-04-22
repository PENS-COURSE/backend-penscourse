import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../authentication/decorators/current-user.decorators';
import { AllowUnauthorizedRequest } from '../authentication/metadata/allow-unauthorized-request.decorator';
import { Auth } from '../utils/decorators/auth.decorator';
import { StreamingService } from './streaming.service';

@ApiTags('Streaming')
@Controller('streaming')
export class StreamingController {
  constructor(private readonly streamingService: StreamingService) {}

  @Auth('admin', 'dosen')
  @Get(':slug/open-room')
  @ApiOkResponse()
  async openRoom(@Param('slug') slug: string, @CurrentUser() user: any) {
    const data = await this.streamingService.openStreaming({
      roomSlug: slug,
      user,
    });

    return {
      message: 'Room opened',
      data: {
        url: `${process.env.STREAMING_SERVICE_URL}?signed=${data}`,
        signature: data,
      },
    };
  }

  @Auth()
  @Get(':slug/join-url')
  @ApiOkResponse()
  async generateJoinUrl(@Param('slug') slug: string, @CurrentUser() user: any) {
    const data = await this.streamingService.generateJoinUrl({
      roomSlug: slug,
      user,
    });

    return {
      message: 'Join URL generated',
      data: {
        url: `${process.env.STREAMING_SERVICE_URL}?signed=${data}`,
        signature: data,
      },
    };
  }

  @Get(':signature')
  @AllowUnauthorizedRequest()
  @ApiOkResponse()
  async verifySignature(@Param('signature') signature: string) {
    const data = await this.streamingService.verifyUrl(signature);

    return {
      message: 'URL verified',
      data,
    };
  }

  @AllowUnauthorizedRequest()
  @ApiBearerAuth()
  @Post('webhook')
  @ApiOkResponse()
  async webhook(@Body() body: any) {
    const data = await this.streamingService.webhook(body);

    return {
      message: 'Webhook received',
      data,
    };
  }

  @AllowUnauthorizedRequest()
  @Get('record/start-record/:slug')
  @ApiOkResponse()
  async startRecordStream(@Param('slug') slug: string) {
    const data = await this.streamingService.startRecord({ roomSlug: slug });

    return {
      message: 'Stream recorded started',
      data,
    };
  }

  @AllowUnauthorizedRequest()
  @Get('record/stop-record/:slug')
  @ApiOkResponse()
  async stopRecordStream(@Param('slug') slug: string) {
    const data = await this.streamingService.stopRecord({ roomSlug: slug });

    return {
      message: 'Stream recorded stopped',
      data,
    };
  }

  @AllowUnauthorizedRequest()
  @Get('record/:slug')
  @ApiOkResponse()
  async getStatusRecordStream(@Param('slug') slug: string) {
    const data = await this.streamingService.statusRecord({ roomSlug: slug });

    return {
      message: 'Record status fetched',
      data,
    };
  }
}
