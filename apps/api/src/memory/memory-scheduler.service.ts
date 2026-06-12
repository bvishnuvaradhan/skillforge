import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MemoryService } from './memory.service';
import { prisma } from '@skillforge/db';

@Injectable()
export class MemorySchedulerService {
  private readonly logger = new Logger(MemorySchedulerService.name);

  constructor(private readonly memoryService: MemoryService) {}

  /**
   * Run nightly decay cron job at 12:00 AM (midnight) every day.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleNightlyDecay() {
    this.logger.log('Starting nightly memory decay cron job...');
    try {
      const users = await prisma.user.findMany({
        where: { deletedAt: null },
        select: { id: true },
      });

      this.logger.log(`Processing memory decay for ${users.length} users...`);

      for (const user of users) {
        try {
          await this.memoryService.decayUserRetention(user.id);
        } catch (error) {
          this.logger.error(`Failed to decay memory retention for user ${user.id}:`, error);
        }
      }

      this.logger.log('Nightly memory decay cron job completed successfully.');
    } catch (error) {
      this.logger.error('Error during nightly memory decay cron job:', error);
    }
  }
}
