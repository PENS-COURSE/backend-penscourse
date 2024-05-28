import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CertificatesService } from './certificates.service';
import { HandleCertificateCreationDto } from './dto/upload-certificate.dto';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificateService: CertificatesService) {}

  @EventPattern('certificate.generated')
  async handleCertificateGenerated(
    @Payload() payload: HandleCertificateCreationDto,
  ) {
    return await this.certificateService.handleCertificateGenerated({
      payload,
    });
  }
}
