import { Module } from '@nestjs/common';
import { GroupTypeService } from './services/group-type.service';
import { GroupRoleService } from './services/group-role.service';
import { ProfileGroupService } from './services/profile-group.service';
import { ProfileGroupMemberService } from './services/profile-group-member.service';
import { GroupTypeController } from './controllers/group-type.controller';
import { GroupRoleController } from './controllers/group-role.controller';
import { ProfileGroupController } from './controllers/profile-group.controller';
import { ProfileGroupMemberController } from './controllers/profile-group-member.controller';

@Module({
  controllers: [
    GroupTypeController,
    GroupRoleController,
    ProfileGroupController,
    ProfileGroupMemberController,
  ],
  providers: [
    GroupTypeService,
    GroupRoleService,
    ProfileGroupService,
    ProfileGroupMemberService,
  ],
})
export class GroupModule {}
