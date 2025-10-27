import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/request/create-organization.dto';
import { UpdateOrganizationDto } from './dto/request/update-organization.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { GetOrganizationsDto } from './dto/query/get-organizations.dto';
import { HybridAuthRequest, JwtAuthRequest } from '../user/interface/requests.interface';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { HybridAuthGuard } from 'src/core/auth/guards/hybrid-auth.guard';
import { SelfUpdateOrganizationDto } from './dto/request/self-update-organization.dto';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('SUPER-ADMIN')
  create(
    @Req() { user }: JwtAuthRequest,
    @Body() createOrganizationDto: CreateOrganizationDto,
  ) {
    return this.organizationService.create(createOrganizationDto, user.sub);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('SUPER-ADMIN')
  findAll(@Query() query: GetOrganizationsDto) {
    return this.organizationService.findAll(query);
  }

  @Get('self')
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.ORGANIZATION__VIEW)
  findSelfOrganization(@Req() { user }: HybridAuthRequest) {
    return this.organizationService.findSelfOrganization(user.organizationId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('SUPER_ADMIN')
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(+id);
  }

  @Patch('self')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.ORGANIZATION__UPDATE)
  updateSelf(
    @Req() { user }: JwtAuthRequest,
    @Body() selfUpdateOrganizationDto: SelfUpdateOrganizationDto,
  ) {
    if (!user.organizationId) throw new BadRequestException('Organization ID is required');

    return this.organizationService.update(user.organizationId, selfUpdateOrganizationDto, user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('SUPER_ADMIN')
  update(
    @Req() { user }: JwtAuthRequest,
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationService.update(
      +id,
      updateOrganizationDto,
      user.sub,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('SUPER-ADMIN')
  remove(@Req() { user }: JwtAuthRequest, @Param('id') id: string) {
    return this.organizationService.remove(+id, user.sub);
  }
}
