import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class SessionCleanupService {
  private readonly logger = new Logger(SessionCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Runs daily at midnight to clean up expired sessions
   * You can customize the schedule using cron expressions:
   * - CronExpression.EVERY_DAY_AT_MIDNIGHT (default)
   * - CronExpression.EVERY_HOUR
   * - '0 0 * * *' (custom cron expression)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'cleanup-expired-sessions',
    timeZone: 'UTC',
  })
  async cleanupExpiredSessions() {
    this.logger.log('Starting cleanup of expired sessions...');

    try {
      const result = await this.prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      this.logger.log(
        `Successfully cleaned up ${result.count} expired session(s)`,
      );

      return result.count;
    } catch (error) {
      this.logger.error('Failed to cleanup expired sessions', error);
      throw error;
    }
  }

  /**
   * Manual cleanup method that can be called on-demand
   * Useful for testing or manual maintenance
   */
  async manualCleanup() {
    this.logger.log('Manual cleanup triggered');
    return this.cleanupExpiredSessions();
  }
}
