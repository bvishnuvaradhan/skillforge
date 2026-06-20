import { Module } from '@nestjs/common';
import { WorldsController } from './worlds.controller';
import { WorldsService } from './worlds.service';
import { DltModule } from '../dlt/dlt.module';
import { AuthModule } from '../auth/auth.module';
import { BossModule } from '../boss/boss.module';

@Module({
  imports: [AuthModule, DltModule, BossModule],
  controllers: [WorldsController],
  providers: [WorldsService],
  exports: [WorldsService],
})
export class WorldsModule {}
