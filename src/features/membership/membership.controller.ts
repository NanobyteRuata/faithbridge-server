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
import { MembershipService } from './membership.service';
import { CreateMembershipDto } from './dto/request/create-membership.dto';
import { UpdateMembershipDto } from './dto/request/update-membership.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { HybridAuthRequest, JwtAuthRequest } from '../user/interface/requests.interface';
import { GetMembershipsDto } from './dto/query/get-memberships.dto';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { HybridAuthGuard } from 'src/core/auth/guards/hybrid-auth.guard';

@Controller('membership')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.MEMBERSHIP__EDIT)
  create(
    @Req() { user }: JwtAuthRequest,
    @Body() createMembershipDto: CreateMembershipDto,
  ) {
    const organizationId = createMembershipDto.organizationId || user.organizationId;
    if (!organizationId) {
      throw new BadRequestException('Organization ID is required');
    }

    return this.membershipService.create(
      createMembershipDto,
      user.sub,
      organizationId,
    );
  }

  @Get()
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.MEMBERSHIP__VIEW)
  findAll(@Req() { user }: HybridAuthRequest, @Query() query: GetMembershipsDto) {
    if (user.organizationId) {
      query.organizationId = user.organizationId;
    }
    return this.membershipService.findAll(query);
  }

  @Get('dropdown')
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.MEMBERSHIP__VIEW)
  findAllDropdown(@Req() { user }: HybridAuthRequest) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID is required');
    }
    return this.membershipService.findAllDropdown(user.organizationId);
  }

  @Get(':id')
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.MEMBERSHIP__VIEW)
  findOne(@Req() { user }: HybridAuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.membershipService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.MEMBERSHIP__EDIT)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: JwtAuthRequest,
    @Body() updateMembershipDto: UpdateMembershipDto,
  ) {
    return this.membershipService.update(
      id,
      updateMembershipDto,
      req.user.sub,
      req.user.organizationId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.MEMBERSHIP__EDIT)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: JwtAuthRequest) {
    return this.membershipService.remove(id, req.user.sub, req.user.organizationId);
  }
}
