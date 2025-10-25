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
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { BulkCreatePermissionsDto } from './dto/request/bulk-create-permissions.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { JwtAuthRequest } from '../user/interface/requests.interface';
import { GetPermissionsDto } from './dto/query/get-permissions.dto';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';

@Controller('permission')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @Permissions('SUPER-ADMIN')
  bulkCreate(
    @Req() { user }: JwtAuthRequest,
    @Body() bulkCreatePermissionDto: BulkCreatePermissionsDto,
  ) {
    return this.permissionService.bulkCreate(bulkCreatePermissionDto, user.sub);
  }

  @Get('constant')
  @Permissions('SUPER-ADMIN')
  constantPermissions() {
    return Object.keys(PERMISSIONS);
  }

  @Get()
  @Permissions('SUPER_ADMIN')
  findAll(@Req() { user }: JwtAuthRequest, @Query() query: GetPermissionsDto) {
    return this.permissionService.findAll(query, user.organizationId);
  }

  @Patch()
  @Permissions('SUPER-ADMIN')
  bulkUpdate(
    @Req() { user }: JwtAuthRequest,
    @Body() bulkUpdatePermissionDto: BulkCreatePermissionsDto,
  ) {
    return this.permissionService.bulkUpdate(bulkUpdatePermissionDto, user.sub);
  }

  @Delete(':id')
  @Permissions('SUPER-ADMIN')
  remove(@Req() { user }: JwtAuthRequest, @Param('id') id: string) {
    return this.permissionService.remove(+id, user.sub);
  }
}
