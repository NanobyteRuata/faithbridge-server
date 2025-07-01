import { Module } from '@nestjs/common';
import { TerminusModule, HealthIndicatorService } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './prisma.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator, HealthIndicatorService],
})
export class HealthModule {}
