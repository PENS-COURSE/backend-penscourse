import { Module } from '@nestjs/common';
import { LivekitModule } from '../utils/library/livekit/livekit.module';
import { StreamingController } from './streaming.controller';
import { StreamingService } from './streaming.service';

@Module({
  imports: [LivekitModule],
  controllers: [StreamingController],
  providers: [StreamingService],
})
export class StreamingModule {}
