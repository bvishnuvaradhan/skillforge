import { Module } from '@nestjs/common';
import { InterviewsController } from './interviews.controller';
import { AiInterviewService } from './ai-interview.service';
import { MentorService } from './mentor.service';
import { LiveInterviewsGateway } from './live-interviews.gateway';
import { AuthModule } from '../auth/auth.module';
import { DltModule } from '../dlt/dlt.module';

@Module({
  imports: [AuthModule, DltModule],
  controllers: [InterviewsController],
  providers: [AiInterviewService, MentorService, LiveInterviewsGateway],
  exports: [AiInterviewService, MentorService, LiveInterviewsGateway],
})
export class InterviewsModule {}
