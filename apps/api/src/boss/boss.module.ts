import { Module } from '@nestjs/common';
import { BossController } from './boss.controller';
import { BossService } from './boss.service';
import { BossSessionService } from './boss.session.service';
import { CodeRunnerService } from './code-runner.service';
import { DltModule } from '../dlt/dlt.module';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [AuthModule, DltModule, CommonModule],
  controllers: [BossController],
  providers: [BossService, BossSessionService, CodeRunnerService],
  exports: [BossService, BossSessionService, CodeRunnerService],
})
export class BossModule {}
