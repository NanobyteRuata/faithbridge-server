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
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/request/create-organization.dto';
import { UpdateOrganizationDto } from './dto/request/update-organization.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { GetOrganizationsDto } from './dto/query/get-organizations.dto';
import { JwtAuthRequest } from '../user/interface/requests.interface';

@Controller('organization')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @Permissions('SUPER-ADMIN')
  create(
    @Req() { user }: JwtAuthRequest,
    @Body() createOrganizationDto: CreateOrganizationDto,
  ) {
    return this.organizationService.create(createOrganizationDto, user.sub);
  }

  @Get()
  @Permissions('SUPER-ADMIN')
  findAll(@Query() query: GetOrganizationsDto) {
    return this.organizationService.findAll(query);
  }

  @Get(':id')
  @Permissions('SUPER_ADMIN')
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(+id);
  }

  @Patch(':id')
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
  @Permissions('SUPER-ADMIN')
  remove(@Req() { user }: JwtAuthRequest, @Param('id') id: string) {
    return this.organizationService.remove(+id, user.sub);
  }
}
