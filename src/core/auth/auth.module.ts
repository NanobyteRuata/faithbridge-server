import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AccessCodeStrategy } from './strategies/access-code.strategy';
import { AccessCodeModule } from 'src/features/access-code/access-code.module';

@Module({
  imports: [
    PassportModule,
    AccessCodeModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRE_IN', '15m'),
        },
      }),
    }),
  ],
  providers: [JwtStrategy, AccessCodeStrategy],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
