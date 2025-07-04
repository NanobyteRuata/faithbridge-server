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
import { MembershipService } from './membership.service';
import { CreateMembershipDto } from './dto/request/create-membership.dto';
import { UpdateMembershipDto } from './dto/request/update-membership.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { JwtAuthRequest } from '../user/interface/requests.interface';
import { GetMembershipsDto } from './dto/query/get-memberships.dto';

@Controller('membership')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Post()
  @Permissions(PERMISSIONS.MEMBERSHIP.CREATE)
  create(
    @Req() req: JwtAuthRequest,
    @Body() createMembershipDto: CreateMembershipDto,
  ) {
    return this.membershipService.create(createMembershipDto, req.user.sub);
  }

  @Get()
  @Permissions(PERMISSIONS.MEMBERSHIP.READ)
  findAll(@Query() query: GetMembershipsDto) {
    return this.membershipService.findAll(query);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.MEMBERSHIP.READ)
  findOne(@Param('id') id: string) {
    return this.membershipService.findOne(+id);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.MEMBERSHIP.UPDATE)
  update(
    @Param('id') id: string,
    @Req() req: JwtAuthRequest,
    @Body() updateMembershipDto: UpdateMembershipDto,
  ) {
    return this.membershipService.update(
      +id,
      updateMembershipDto,
      req.user.sub,
    );
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.MEMBERSHIP.DELETE)
  remove(@Param('id') id: string, @Req() req: JwtAuthRequest) {
    return this.membershipService.remove(+id, req.user.sub);
  }
}
