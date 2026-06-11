import { Module } from '@nestjs/common';
import { WorldsController } from './worlds.controller';
import { WorldsService } from './worlds.service';
import { DltModule } from '../dlt/dlt.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, DltModule],
  controllers: [WorldsController],
  providers: [WorldsService],
  exports: [WorldsService],
})
export class WorldsModule {}
