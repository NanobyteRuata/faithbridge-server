import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
import { OrganizationModule } from './features/organization/organization.module';
import { PermissionModule } from './features/permission/permission.module';
import { GroupModule } from './features/group/group.module';
import { THROTTLE_CONFIG } from './core/throttler/throttler.config';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([THROTTLE_CONFIG.default]),
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
    OrganizationModule,
    PermissionModule,
    GroupModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
