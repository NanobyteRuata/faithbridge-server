import { Module } from '@nestjs/common';
import { UserModule } from './features/user/user.module';
import { AppConfigModule } from './core/app-config/app-config.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { HealthModule } from './core/health/health.module';
import { AuthModule } from './core/auth/auth.module';
import { RoleModule } from './features/role/role.module';
import { ProfileModule } from './features/profile/profile.module';
import { MembershipModule } from './features/membership/membership.module';
import { StatusModule } from './features/status/status.module';
import { AccessCodeModule } from './features/access-code/access-code.module';
import { RelationshipModule } from './features/relationship/relationship.module';
import { AddressModule } from './features/address/address.module';

@Module({
  imports: [
    PrismaModule,
    AppConfigModule,
    UserModule,
    HealthModule,
    AuthModule,
    RoleModule,
    ProfileModule,
    MembershipModule,
    StatusModule,
    AccessCodeModule,
    RelationshipModule,
    AddressModule,
  ],
})
export class AppModule {}
