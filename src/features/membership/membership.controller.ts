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
} from '@nestjs/common';
import { MembershipService } from './membership.service';
import { CreateMembershipDto } from './dto/request/create-membership.dto';
import { UpdateMembershipDto } from './dto/request/update-membership.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { JwtAuthRequest } from '../user/interface/requests.interface';
import { GetMembershipsDto } from './dto/query/get-memberships.dto';

@Controller('membership')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Post()
  @Permissions('SUPER_ADMIN')
  create(
    @Req() { user }: JwtAuthRequest,
    @Body() createMembershipDto: CreateMembershipDto,
  ) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID not found');
    }

    return this.membershipService.create(
      createMembershipDto,
      user.sub,
      user.organizationId,
    );
  }

  @Get()
  @Permissions('SUPER_ADMIN')
  findAll(@Query() query: GetMembershipsDto) {
    return this.membershipService.findAll(query);
  }

  @Get(':id')
  @Permissions('SUPER_ADMIN')
  findOne(@Param('id') id: string) {
    return this.membershipService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('SUPER_ADMIN')
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
  @Permissions('SUPER_ADMIN')
  remove(@Param('id') id: string, @Req() req: JwtAuthRequest) {
    return this.membershipService.remove(+id, req.user.sub);
  }
}
