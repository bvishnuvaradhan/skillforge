import { Module } from '@nestjs/common';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { AuthModule } from '../auth/auth.module';
import { DltModule } from '../dlt/dlt.module';

@Module({
  imports: [AuthModule, DltModule],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}
