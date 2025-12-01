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
import { HouseholdService } from './household.service';
import { CreateHouseholdDto } from './dto/request/create-household.dto';
import { UpdateHouseholdDto } from './dto/request/update-household.dto';
import { GetHouseholdsDto } from './dto/query/get-households.dto';
import { HybridAuthGuard } from 'src/core/auth/guards/hybrid-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { HybridAuthRequest } from '../user/interface/requests.interface';
import {
  ThrottleRead,
  ThrottleWrite,
} from 'src/core/throttler/throttler.decorator';
import { AddHouseholdMembersDto } from './dto/request/add-household-member.dto';
import { RemoveHouseholdMembersDto } from './dto/request/remove-household-members';

@Controller('household')
export class HouseholdController {
  constructor(private readonly householdService: HouseholdService) {}

  @Post()
  @ThrottleWrite()
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.PROFILE__EDIT)
  create(
    @Req() { user }: HybridAuthRequest,
    @Body() createHouseholdDto: CreateHouseholdDto,
  ) {
    const userId = 'sub' in user ? user.sub : 0;
    return this.householdService.create(
      createHouseholdDto,
      userId,
      user.organizationId,
    );
  }

  @Get()
  @ThrottleRead()
  @UseGuards(HybridAuthGuard)
  findAll(
    @Req() { user }: HybridAuthRequest,
    @Query() query: GetHouseholdsDto,
  ) {
    return this.householdService.findAll(query, user.organizationId);
  }

  @Get('dropdown')
  @ThrottleRead()
  @UseGuards(HybridAuthGuard)
  findAllDropdown(@Req() { user }: HybridAuthRequest, @Query() query: GetHouseholdsDto) {
    return this.householdService.findAllDropdown(query, user.organizationId);
  }

  @Get(':id')
  @ThrottleRead()
  @UseGuards(HybridAuthGuard)
  findOne(@Req() { user }: HybridAuthRequest, @Param('id') id: number) {
    return this.householdService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @ThrottleWrite()
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.PROFILE__EDIT)
  update(
    @Req() { user }: HybridAuthRequest,
    @Param('id') id: number,
    @Body() updateHouseholdDto: UpdateHouseholdDto,
  ) {
    const userId = 'sub' in user ? user.sub : 0;
    return this.householdService.update(
      id,
      updateHouseholdDto,
      userId,
      user.organizationId,
    );
  }

  @Delete(':id')
  @ThrottleWrite()
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.PROFILE__EDIT)
  remove(@Req() { user }: HybridAuthRequest, @Param('id') id: number) {
    const userId = 'sub' in user ? user.sub : 0;
    return this.householdService.remove(id, userId, user.organizationId);
  }

  @Post(':householdId/member/add')
  @ThrottleWrite()
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.PROFILE__EDIT)
  addMembers(
    @Req() { user }: HybridAuthRequest,
    @Param('householdId') householdId: number,
    @Body() { profileIds }: AddHouseholdMembersDto,
  ) {
    const updatedById = 'sub' in user ? user.sub : 0;
    return this.householdService.addMembers(
      householdId,
      profileIds,
      updatedById,
      user.organizationId,
    );
  }

  @Post(':householdId/member/remove')
  @ThrottleWrite()
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.PROFILE__EDIT)
  removeMember(
    @Req() { user }: HybridAuthRequest,
    @Param('householdId') householdId: number,
    @Body() { profileIds }: RemoveHouseholdMembersDto,
  ) {
    const updatedById = 'sub' in user ? user.sub : 0;
    return this.householdService.removeMembers(
      householdId,
      profileIds,
      updatedById,
      user.organizationId,
    );
  }
}
