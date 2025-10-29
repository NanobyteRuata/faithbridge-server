import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { GroupRoleService } from '../services/group-role.service';
import { CreateGroupRoleDto } from '../dto/request/group-role/create-group-role.dto';
import { UpdateGroupRoleDto } from '../dto/request/group-role/update-group-role.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { HybridAuthRequest, JwtAuthRequest } from '../../user/interface/requests.interface';
import { GetGroupRolesDto } from '../dto/query/get-group-roles.dto';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { HybridAuthGuard } from 'src/core/auth/guards/hybrid-auth.guard';

@Controller('group-role')
export class GroupRoleController {
  constructor(private readonly groupRoleService: GroupRoleService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__EDIT)
  create(
    @Req() { user }: JwtAuthRequest,
    @Body() createGroupRoleDto: CreateGroupRoleDto,
  ) {
    const organizationId = createGroupRoleDto.organizationId || user.organizationId;
    if (!organizationId) {
      throw new BadRequestException('Organization ID is required');
    }

    return this.groupRoleService.create(
      createGroupRoleDto,
      user.sub,
      organizationId,
    );
  }

  @Get()
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__VIEW)
  findAll(@Req() { user }: HybridAuthRequest, @Query() query: GetGroupRolesDto) {
    if (user.organizationId) {
      query.organizationId = user.organizationId;
    }
    return this.groupRoleService.findAll(query);
  }

  @Get('dropdown')
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.PROFILE__VIEW, PERMISSIONS.PROFILE__UPDATE_SELF, PERMISSIONS.PROFILE__UPDATE, PERMISSIONS.PROFILE__CREATE)
  findAllDropdown(@Req() { user }: HybridAuthRequest, @Query() query: GetGroupRolesDto) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID is required');
    }
    return this.groupRoleService.findAllDropdown(user.organizationId, query.groupTypeId);
  }

  @Get(':id')
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__VIEW)
  findOne(@Req() { user }: HybridAuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.groupRoleService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__EDIT)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: JwtAuthRequest,
    @Body() updateGroupRoleDto: UpdateGroupRoleDto,
  ) {
    return this.groupRoleService.update(
      id,
      updateGroupRoleDto,
      req.user.sub,
      req.user.organizationId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__EDIT)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: JwtAuthRequest) {
    return this.groupRoleService.remove(id, req.user.sub, req.user.organizationId);
  }
}
