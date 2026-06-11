import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { DltModule } from '../dlt/dlt.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, DltModule],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
