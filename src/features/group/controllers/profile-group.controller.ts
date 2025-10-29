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
import { ProfileGroupService } from '../services/profile-group.service';
import { CreateProfileGroupDto } from '../dto/request/profile-group/create-profile-group.dto';
import { UpdateProfileGroupDto } from '../dto/request/profile-group/update-profile-group.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { HybridAuthRequest, JwtAuthRequest } from '../../user/interface/requests.interface';
import { GetProfileGroupsDto } from '../dto/query/get-profile-groups.dto';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { HybridAuthGuard } from 'src/core/auth/guards/hybrid-auth.guard';

@Controller('profile-group')
export class ProfileGroupController {
  constructor(private readonly profileGroupService: ProfileGroupService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__EDIT)
  create(
    @Req() { user }: JwtAuthRequest,
    @Body() createProfileGroupDto: CreateProfileGroupDto,
  ) {
    const organizationId = createProfileGroupDto.organizationId || user.organizationId;
    if (!organizationId) {
      throw new BadRequestException('Organization ID is required');
    }

    return this.profileGroupService.create(
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
    return this.profileGroupService.findAll(query);
  }

  @Get('dropdown')
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__VIEW)
  findAllDropdown(@Req() { user }: HybridAuthRequest, @Query() query: GetProfileGroupsDto) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID is required');
    }
    return this.profileGroupService.findAllDropdown(user.organizationId, query.groupTypeId);
  }

  @Get(':id')
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__VIEW)
  findOne(@Req() { user }: HybridAuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.profileGroupService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__EDIT)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: JwtAuthRequest,
    @Body() updateProfileGroupDto: UpdateProfileGroupDto,
  ) {
    return this.profileGroupService.update(
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
    return this.profileGroupService.remove(id, req.user.sub, req.user.organizationId);
  }
}
