import { Module } from '@nestjs/common';
import { CareerController } from './career.controller';
import { ResumeService } from './resume.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CareerController],
  providers: [ResumeService],
  exports: [ResumeService],
})
export class CareerModule {}
