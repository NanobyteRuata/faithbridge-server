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
import { StatusService } from './status.service';
import { CreateStatusDto } from './dto/request/create-status.dto';
import { UpdateStatusDto } from './dto/request/update-status.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { HybridAuthRequest, JwtAuthRequest } from '../user/interface/requests.interface';
import { GetStatusesDto } from './dto/query/get-statuses.dto';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { HybridAuthGuard } from 'src/core/auth/guards/hybrid-auth.guard';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.STATUS__EDIT)
  create(
    @Body() createStatusDto: CreateStatusDto,
    @Req() { user }: JwtAuthRequest,
  ) {
    const organizationId = createStatusDto.organizationId || user.organizationId;
    if (!organizationId) {
      throw new BadRequestException('Organization ID is required');
    }

    return this.statusService.create(
      createStatusDto,
      user.sub,
      organizationId,
    );
  }

  @Get()
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.STATUS__VIEW)
  findAll(@Req() { user }: HybridAuthRequest, @Query() query: GetStatusesDto) {
    if (user.organizationId) {
      query.organizationId = user.organizationId;
    }
    return this.statusService.findAll(query);
  }

  @Get('dropdown')
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.STATUS__VIEW)
  findAllDropdown(@Req() { user }: HybridAuthRequest) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID is required');
    }
    return this.statusService.findAllDropdown(user.organizationId);
  }

  @Get(':id')
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.STATUS__VIEW)
  findOne(@Param('id', ParseIntPipe) id: number, @Req() { user }: HybridAuthRequest) {
    return this.statusService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.STATUS__EDIT)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
    @Req() req: JwtAuthRequest,
  ) {
    return this.statusService.update(id, updateStatusDto, req.user.sub, req.user.organizationId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.STATUS__EDIT)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: JwtAuthRequest) {
    return this.statusService.remove(id, req.user.sub, req.user.organizationId);
  }
}
