import { Module } from '@nestjs/common';
import { DltController } from './dlt.controller';
import { DltService } from './dlt.service';
import { DltWorkerService } from './dlt-worker.service';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [AuthModule, CommonModule],
  controllers: [DltController],
  providers: [DltService, DltWorkerService],
  exports: [DltService, DltWorkerService],
})
export class DltModule {}
