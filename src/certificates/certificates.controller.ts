import { Body, Controller, Get, Header, Param, Post } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../authentication/decorators/current-user.decorators';
import { AllowUnauthorizedRequest } from '../authentication/metadata/allow-unauthorized-request.decorator';
import { Auth } from '../utils/decorators/auth.decorator';
import { WithoutModifiedResponse } from '../utils/decorators/without-modified-response.decorator';
import { CertificatesService } from './certificates.service';
import { GenerateCertificateDto } from './dto/generate-certificate.dto';
import { HandleCertificateCreationDto } from './dto/upload-certificate.dto';

@ApiTags('Certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificateService: CertificatesService) {}

  @Auth('admin', 'dosen')
  @ApiOperation({ summary: 'Generate Certificate' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  @Post('generate')
  async generateCertificate(@Body() payload: GenerateCertificateDto) {
    const data = await this.certificateService.generateCertificate({ payload });

    return {
      message: 'Successfully generate certificate',
      data,
    };
  }

  @WithoutModifiedResponse()
  @AllowUnauthorizedRequest()
  @ApiOperation({ summary: 'Get Thumbnail' })
  @ApiOkResponse()
  @Header('Content-Type', 'image/png')
  @Get('thumbnail/:thumbnail_path')
  async getThumbnail(@Param('thumbnail_path') thumbnail_path: string) {
    return await this.certificateService.getThumbnailBlob({ thumbnail_path });
  }

  @WithoutModifiedResponse()
  @Auth('user')
  @ApiOperation({ summary: 'Download Certificate' })
  @ApiOkResponse()
  @Header('Content-Type', 'application/pdf')
  @Get('download/:certificate_uuid')
  async requestDownloadCertificate(
    @Param('certificate_uuid') certificate_uuid: string,
    @CurrentUser() user: any,
  ) {
    return await this.certificateService.requestDownloadCertificate({
      certificate_uuid,
      user,
    });
  }

  @EventPattern('certificate.generated')
  async handleCertificateGenerated(
    @Payload() payload: HandleCertificateCreationDto,
  ) {
    return await this.certificateService.handleCertificateGenerated({
      payload,
    });
  }
}
