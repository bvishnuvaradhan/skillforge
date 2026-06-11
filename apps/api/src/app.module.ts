import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { CommonModule } from './common/common.module';
import { DltModule } from './dlt/dlt.module';
import { WorldsModule } from './worlds/worlds.module';
import { GamesModule } from './games/games.module';
import { BossModule } from './boss/boss.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    OnboardingModule,
    CommonModule,
    DltModule,
    WorldsModule,
    GamesModule,
    BossModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
