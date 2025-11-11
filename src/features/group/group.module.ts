import { Module } from '@nestjs/common';
import { GroupTypeService } from './services/group-type.service';
import { GroupRoleService } from './services/group-role.service';
import { GroupService } from './services/group.service';
import { GroupProfileService } from './services/group-profile.service';
import { GroupTypeController } from './controllers/group-type.controller';
import { GroupRoleController } from './controllers/group-role.controller';
import { GroupController } from './controllers/group.controller';
import { ProfileGroupMemberController } from './controllers/group-profile.controller';

@Module({
  controllers: [
    GroupTypeController,
    GroupRoleController,
    GroupController,
    ProfileGroupMemberController,
  ],
  providers: [
    GroupTypeService,
    GroupRoleService,
    GroupService,
    GroupProfileService,
  ],
})
export class GroupModule {}
