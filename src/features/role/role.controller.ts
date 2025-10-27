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
  @Permissions(PERMISSIONS.ROLE__CREATE)
  createRole(@Req() req: JwtAuthRequest, @Body() createRoleDto: CreateRoleDto) {
    return this.roleService.createRole(createRoleDto, req.user.sub);
  }

  @Get()
  @Permissions(PERMISSIONS.ROLE__VIEW)
  findAllRoles(@Query() query: GetRolesDto) {
    return this.roleService.findAllRoles(query);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.ROLE__VIEW)
  findOneRole(@Param('id') id: string) {
    return this.roleService.findOneRole(+id);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.ROLE__UPDATE)
  updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Req() req: JwtAuthRequest,
  ) {
    return this.roleService.updateRole(+id, updateRoleDto, req.user.sub);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.ROLE__DELETE)
  removeRole(@Param('id') id: string, @Req() req: JwtAuthRequest) {
    return this.roleService.removeRole(+id, req.user.sub);
  }
}
