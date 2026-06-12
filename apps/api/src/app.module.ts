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
import { MemoryModule } from './memory/memory.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { RoadmapModule } from './roadmap/roadmap.module';
import { MentorModule } from './mentor-ai/mentor.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    OnboardingModule,
    CommonModule,
    DltModule,
    WorldsModule,
    GamesModule,
    BossModule,
    MemoryModule,
    RecommendationsModule,
    RoadmapModule,
    MentorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
