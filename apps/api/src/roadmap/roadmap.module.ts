import { Module } from '@nestjs/common';
import { RoadmapController } from './roadmap.controller';
import { RoadmapService } from './roadmap.service';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [AuthModule, CommonModule],
  controllers: [RoadmapController],
  providers: [RoadmapService],
  exports: [RoadmapService],
})
export class RoadmapModule {}
