import { Module } from '@nestjs/common';
import { MemoryController } from './memory.controller';
import { MemoryService } from './memory.service';
import { MemorySchedulerService } from './memory-scheduler.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MemoryController],
  providers: [MemoryService, MemorySchedulerService],
  exports: [MemoryService],
})
export class MemoryModule {}
