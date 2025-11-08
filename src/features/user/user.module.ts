import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from 'src/core/auth/auth.module';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { SharedModule } from 'src/shared/shared.module';
import { SessionCleanupService } from './services/session-cleanup.service';

@Module({
  imports: [AuthModule, SharedModule],
  providers: [UserService, LocalStrategy, JwtRefreshStrategy, SessionCleanupService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
