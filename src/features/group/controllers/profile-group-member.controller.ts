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
import { ProfileGroupMemberService } from '../services/profile-group-member.service';
import { CreateProfileGroupMemberDto } from '../dto/request/profile-group-member/create-profile-group-member.dto';
import { UpdateProfileGroupMemberDto } from '../dto/request/profile-group-member/update-profile-group-member.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { HybridAuthRequest, JwtAuthRequest } from '../../user/interface/requests.interface';
import { GetProfileGroupMembersDto } from '../dto/query/get-profile-group-members.dto';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { HybridAuthGuard } from 'src/core/auth/guards/hybrid-auth.guard';

@Controller('profile-group-member')
export class ProfileGroupMemberController {
  constructor(private readonly profileGroupMemberService: ProfileGroupMemberService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__EDIT)
  create(
    @Req() { user }: JwtAuthRequest,
    @Body() createProfileGroupMemberDto: CreateProfileGroupMemberDto,
  ) {
    const organizationId = createProfileGroupMemberDto.organizationId || user.organizationId;
    if (!organizationId) {
      throw new BadRequestException('Organization ID is required');
    }

    return this.profileGroupMemberService.create(
      createProfileGroupMemberDto,
      user.sub,
      organizationId,
    );
  }

  @Get()
  @UseGuards(HybridAuthGuard)
  findAll(@Req() { user }: HybridAuthRequest, @Query() query: GetProfileGroupMembersDto) {
    if (user.organizationId) {
      query.organizationId = user.organizationId;
    }
    return this.profileGroupMemberService.findAll(query);
  }

  @Get(':id')
  @UseGuards(HybridAuthGuard)
  findOne(@Req() { user }: HybridAuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.profileGroupMemberService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__EDIT)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: JwtAuthRequest,
    @Body() updateProfileGroupMemberDto: UpdateProfileGroupMemberDto,
  ) {
    return this.profileGroupMemberService.update(
      id,
      updateProfileGroupMemberDto,
      req.user.sub,
      req.user.organizationId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__EDIT)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: JwtAuthRequest) {
    return this.profileGroupMemberService.remove(id, req.user.sub, req.user.organizationId);
  }
}
