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
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/request/create-role.dto';
import { UpdateRoleDto } from './dto/request/update-role.dto';
import { GetRolesDto } from './dto/query/get-roles.dto';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';

@Controller('role')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('permissions')
  @Permissions(PERMISSIONS.PERMISSION.READ)
  findAllPermissions() {
    return this.roleService.findAllPermissions();
  }

  @Post()
  @Permissions(PERMISSIONS.ROLE.CREATE)
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.createRole(createRoleDto);
  }

  @Get()
  @Permissions(PERMISSIONS.ROLE.READ)
  findAllRoles(@Query() query: GetRolesDto) {
    return this.roleService.findAllRoles(query);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.ROLE.READ)
  findOneRole(@Param('id') id: string) {
    return this.roleService.findOneRole(+id);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.ROLE.UPDATE)
  updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.updateRole(+id, updateRoleDto);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.ROLE.DELETE)
  removeRole(@Param('id') id: string) {
    return this.roleService.removeRole(+id);
  }
}
