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
import { GroupService } from '../services/group.service';
import { CreateGroupDto } from '../dto/request/group/create-group.dto';
import { UpdateGroupDto } from '../dto/request/group/update-group.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { HybridAuthRequest, JwtAuthRequest } from '../../user/interface/requests.interface';
import { GetProfileGroupsDto } from '../dto/query/get-profile-groups.dto';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { HybridAuthGuard } from 'src/core/auth/guards/hybrid-auth.guard';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__EDIT)
  create(
    @Req() { user }: JwtAuthRequest,
    @Body() createProfileGroupDto: CreateGroupDto,
  ) {
    const organizationId = createProfileGroupDto.organizationId || user.organizationId;
    if (!organizationId) {
      throw new BadRequestException('Organization ID is required');
    }

    return this.groupService.create(
      createProfileGroupDto,
      user.sub,
      organizationId,
    );
  }

  @Get()
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__VIEW)
  findAll(@Req() { user }: HybridAuthRequest, @Query() query: GetProfileGroupsDto) {
    if (user.organizationId) {
      query.organizationId = user.organizationId;
    }
    return this.groupService.findAll(query);
  }

  @Get('dropdown')
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__VIEW)
  findAllDropdown(@Req() { user }: HybridAuthRequest, @Query() query: GetProfileGroupsDto) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID is required');
    }
    return this.groupService.findAllDropdown(user.organizationId, query.groupTypeId);
  }

  @Get(':id')
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__VIEW)
  findOne(@Req() { user }: HybridAuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.groupService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__EDIT)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: JwtAuthRequest,
    @Body() updateProfileGroupDto: UpdateGroupDto,
  ) {
    return this.groupService.update(
      id,
      updateProfileGroupDto,
      req.user.sub,
      req.user.organizationId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__EDIT)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: JwtAuthRequest) {
    return this.groupService.remove(id, req.user.sub, req.user.organizationId);
  }
}
