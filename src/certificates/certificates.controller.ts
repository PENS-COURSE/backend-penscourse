import { Controller, Get, Header, Param, Post } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AllowUnauthorizedRequest } from '../authentication/metadata/allow-unauthorized-request.decorator';
import { Auth } from '../utils/decorators/auth.decorator';
import { WithoutModifiedResponse } from '../utils/decorators/without-modified-response.decorator';
import { CertificatesService } from './certificates.service';
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
  async generateCertificate() {
    const data = await this.certificateService.generateCertificate();

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

  @EventPattern('certificate.generated')
  async handleCertificateGenerated(
    @Payload() payload: HandleCertificateCreationDto,
  ) {
    return await this.certificateService.handleCertificateGenerated({
      payload,
    });
  }
}
