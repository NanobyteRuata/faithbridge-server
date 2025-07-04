import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from 'src/core/auth/auth.module';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { SharedModule } from 'src/shared/shared.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [AuthModule, ProfileModule, SharedModule],
  providers: [UserService, LocalStrategy, JwtRefreshStrategy],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
