import { Module } from '@nestjs/common';
import { DltController } from './dlt.controller';
import { IntelligenceController } from './intelligence.controller';
import { DltService } from './dlt.service';
import { DltWorkerService } from './dlt-worker.service';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';
import { RoadmapModule } from '../roadmap/roadmap.module';

@Module({
  imports: [AuthModule, CommonModule, RoadmapModule],
  controllers: [DltController, IntelligenceController],
  providers: [DltService, DltWorkerService],
  exports: [DltService, DltWorkerService],
})
export class DltModule {}
