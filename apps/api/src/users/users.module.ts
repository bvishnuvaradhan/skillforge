import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { ProfileSyncService } from './profile-sync.service';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UsersService, ProfileSyncService],
  exports: [UsersService, ProfileSyncService],
})
export class UsersModule {}
