import { Global, Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { LiveClassGateway } from './live-class.gateway';
import { LiveClassService } from './live-class.service';

@Global()
@Module({
  imports: [AuthenticationModule],
  controllers: [],
  providers: [LiveClassService, LiveClassGateway],
  exports: [LiveClassService],
})
export class LiveClassModule {}
