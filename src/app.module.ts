import { Module } from '@nestjs/common';
import { UserModule } from './features/user/user.module';
import { AppConfigModule } from './core/app-config/app-config.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { HealthModule } from './core/health/health.module';

@Module({
  imports: [PrismaModule, AppConfigModule, UserModule, HealthModule],
})
export class AppModule {}
