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
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';

@Controller('profile')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @Permissions(PERMISSIONS.PROFILE.CREATE)
  create(
    @Req() req: JwtAuthRequest,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return this.profileService.create(createProfileDto, req.user.sub);
  }

  @Get()
  @Permissions(PERMISSIONS.PROFILE.READ)
  findAll(@Query() query: GetProfilesDto) {
    return this.profileService.findAll(query);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.PROFILE.READ)
  findOne(@Param('id') id: string) {
    return this.profileService.findOne(+id);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.PROFILE.UPDATE)
  update(
    @Param('id') id: string,
    @Req() req: JwtAuthRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profileService.update(+id, updateProfileDto, req.user.sub);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.PROFILE.DELETE)
  remove(@Req() req: JwtAuthRequest, @Param('id') id: string) {
    return this.profileService.remove(+id, req.user.sub);
  }
}
