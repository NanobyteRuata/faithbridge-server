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
import { GroupProfileService } from '../services/group-profile.service';
import { CreateGroupProfileDto } from '../dto/request/group-profile/create-group-profile';
import { UpdateGroupProfileDto } from '../dto/request/group-profile/update-group-profile';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { HybridAuthRequest, JwtAuthRequest } from '../../user/interface/requests.interface';
import { GetGroupProfilesDto } from '../dto/query/get-group-profiles.dto';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { HybridAuthGuard } from 'src/core/auth/guards/hybrid-auth.guard';

@Controller('group-profile')
export class ProfileGroupMemberController {
  constructor(private readonly groupProfileService: GroupProfileService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__EDIT)
  create(
    @Req() { user }: JwtAuthRequest,
    @Body() createProfileGroupMemberDto: CreateGroupProfileDto,
  ) {
    const organizationId = createProfileGroupMemberDto.organizationId || user.organizationId;
    if (!organizationId) {
      throw new BadRequestException('Organization ID is required');
    }

    return this.groupProfileService.create(
      createProfileGroupMemberDto,
      user.sub,
      organizationId,
    );
  }

  @Get()
  @UseGuards(HybridAuthGuard)
  findAll(@Req() { user }: HybridAuthRequest, @Query() query: GetGroupProfilesDto) {
    if (user.organizationId) {
      query.organizationId = user.organizationId;
    }
    return this.groupProfileService.findAll(query);
  }

  @Get(':id')
  @UseGuards(HybridAuthGuard)
  findOne(@Req() { user }: HybridAuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.groupProfileService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.GROUP__EDIT)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: JwtAuthRequest,
    @Body() updateProfileGroupMemberDto: UpdateGroupProfileDto,
  ) {
    return this.groupProfileService.update(
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
    return this.groupProfileService.remove(id, req.user.sub, req.user.organizationId);
  }
}
