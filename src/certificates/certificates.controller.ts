import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../authentication/decorators/current-user.decorators';
import { AllowUnauthorizedRequest } from '../authentication/metadata/allow-unauthorized-request.decorator';
import { Auth } from '../utils/decorators/auth.decorator';
import { UUIDParam } from '../utils/decorators/uuid-param.decorator';
import { WithoutModifiedResponse } from '../utils/decorators/without-modified-response.decorator';
import { CertificatesService } from './certificates.service';
import { GenerateCertificateDto } from './dto/generate-certificate.dto';
import { HandleCertificateCreationDto } from './dto/upload-certificate.dto';

@ApiTags('Certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificateService: CertificatesService) {}

  @Auth('user')
  @ApiOperation({ summary: 'Get Certificates by User' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 25 })
  @ApiOkResponse()
  @Get()
  async getCertificatesByUser(
    @CurrentUser() user: any,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    const data = await this.certificateService.getCertificatesByUser({
      user,
      limit,
      page,
    });

    return {
      message: 'Successfully get certificates',
      data,
    };
  }

  @Auth()
  @ApiOperation({ summary: 'Get Certificates by Course' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 25 })
  @ApiOkResponse()
  @Get('course/:course_slug')
  async getCertificatesByCourse(
    @Param('course_slug') courseSlug: string,
    @CurrentUser() user: any,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    const data = await this.certificateService.getCertificatesByCourse({
      course_slug: courseSlug,
      user,
      limit,
      page,
    });

    return {
      message: 'Successfully get certificates',
      data,
    };
  }

  @Auth()
  @ApiOperation({ summary: 'Get Certificate by UUID' })
  @ApiOkResponse()
  @Get(':certificate_uuid')
  async getCertificateByUuid(
    @UUIDParam('certificate_uuid') certificateUUID: string,
    @CurrentUser() user: any,
  ) {
    const data = await this.certificateService.getCertificateByUuid({
      certificate_uuid: certificateUUID,
      user,
    });

    return {
      message: 'Successfully get certificate',
      data,
    };
  }

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
    @UUIDParam('certificate_uuid') certificate_uuid: string,
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
