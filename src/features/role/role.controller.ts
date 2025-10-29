import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/request/create-role.dto';
import { UpdateRoleDto } from './dto/request/update-role.dto';
import { GetRolesDto } from './dto/query/get-roles.dto';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { JwtAuthRequest } from '../user/interface/requests.interface';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';

@Controller('role')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('permissions')
  @Permissions(PERMISSIONS.ROLE__VIEW)
  findAllPermissions() {
    return this.roleService.findAllPermissions();
  }

  @Post()
  @Permissions(PERMISSIONS.ROLE__EDIT)
  createRole(@Req() { user }: JwtAuthRequest, @Body() createRoleDto: CreateRoleDto) {
    if (!user.isSuperAdmin) {
      createRoleDto.isOwner = false;
    }
    return this.roleService.createRole(createRoleDto, user.sub);
  }

  @Get()
  @Permissions(PERMISSIONS.ROLE__VIEW)
  findAllRoles(@Query() query: GetRolesDto) {
    return this.roleService.findAllRoles(query);
  }

  @Get('dropdown')
  @Permissions(PERMISSIONS.ROLE__VIEW)
  findAllDropdown(@Req() { user }: JwtAuthRequest) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID is required');
    }
    return this.roleService.findAllDropdown(user.organizationId);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.ROLE__VIEW)
  findOneRole(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.findOneRole(id);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.ROLE__EDIT)
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
    @Req() { user }: JwtAuthRequest,
  ) {
    if (!user.isSuperAdmin && updateRoleDto.isOwner) {
      delete updateRoleDto.permissions;
    }
    return this.roleService.updateRole(id, updateRoleDto, user.sub);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.ROLE__EDIT)
  removeRole(@Param('id', ParseIntPipe) id: number, @Req() { user }: JwtAuthRequest) {
    return this.roleService.removeRole(id, user);
  }
}
