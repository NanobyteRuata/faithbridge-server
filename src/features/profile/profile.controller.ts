import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/request/create-profile.dto';
import { UpdateProfileDto } from './dto/request/update-profile.dto';
import { GetProfilesDto } from './dto/query/get-profiles.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { JwtAuthRequest } from '../user/interface/requests.interface';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { HybridAuthGuard } from 'src/core/auth/guards/hybrid-auth.guard';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.PROFILE__EDIT)
  create(
    @Req() req: JwtAuthRequest,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return this.profileService.create(createProfileDto, req.user.sub, req.user.organizationId);
  }

  @Get()
  @UseGuards(HybridAuthGuard)
  findAll(@Query() query: GetProfilesDto, @Req() req: JwtAuthRequest) {
    return this.profileService.findAll(query, req.user.organizationId);
  }

  @Get('dropdown')
  @UseGuards(HybridAuthGuard)
  findAllDropdown(@Query() query: GetProfilesDto, @Req() req: JwtAuthRequest) {
    return this.profileService.findAllDropdown(query, req.user.organizationId);
  }

  @Get(':id')
  @UseGuards(HybridAuthGuard)
  findOne(@Param('id') id: string, @Req() req: JwtAuthRequest) {
    return this.profileService.findOne(+id, req.user.organizationId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.PROFILE__EDIT)
  update(
    @Param('id') id: string,
    @Req() req: JwtAuthRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profileService.update(+id, updateProfileDto, req.user.sub, req.user.organizationId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.PROFILE__EDIT)
  remove(@Req() req: JwtAuthRequest, @Param('id') id: string) {
    return this.profileService.remove(+id, req.user.sub);
  }
}
