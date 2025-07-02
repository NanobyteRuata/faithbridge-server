import { Module } from '@nestjs/common';
import { UserModule } from './features/user/user.module';
import { AppConfigModule } from './core/app-config/app-config.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { HealthModule } from './core/health/health.module';
import { AuthModule } from './core/auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AppConfigModule,
    UserModule,
    HealthModule,
    AuthModule,
  ],
})
export class AppModule {}
