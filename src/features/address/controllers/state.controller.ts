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
  ParseIntPipe,
} from '@nestjs/common';
import { StateService } from '../services/state.service';
import { CreateStateDto } from '../dto/requests/state/create-state.dto';
import { UpdateStateDto } from '../dto/requests/state/update-state.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { GetStatesDto } from '../dto/query/get-states.dto';
import { HybridAuthRequest, JwtAuthRequest } from '../../user/interface/requests.interface';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { HybridAuthGuard } from 'src/core/auth/guards/hybrid-auth.guard';

@Controller('state')
export class StateController {
  constructor(private readonly stateService: StateService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.LOCATION_DATA__EDIT)
  create(
    @Req() { user }: JwtAuthRequest,
    @Body() createStateDto: CreateStateDto,
  ) {
    const organizationId = user.organizationId || createStateDto.organizationId;
    if (!organizationId) {
      throw new BadRequestException('Organization ID not found');
    }

    return this.stateService.create(createStateDto, organizationId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.LOCATION_DATA__VIEW)
  findAll(@Req() { user }: JwtAuthRequest, @Query() query: GetStatesDto) {
    if (user.organizationId) {
      query.organizationId = user.organizationId;
    }
    return this.stateService.findAll(query);
  }

  @Get('dropdown')
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(
    PERMISSIONS.PROFILE__VIEW,
    PERMISSIONS.PROFILE__UPDATE_SELF,
    PERMISSIONS.PROFILE__CREATE,
    PERMISSIONS.PROFILE__UPDATE,
  )
  findAllDropdown(
    @Req() { user }: HybridAuthRequest,
    @Query('countryId', ParseIntPipe) countryId: number,
  ) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID is required');
    }
    if (!countryId) {
      throw new BadRequestException('Country ID is required');
    }
    return this.stateService.findAllDropdown(user.organizationId, countryId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.LOCATION_DATA__VIEW)
  findOne(@Req() { user }: JwtAuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.stateService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.LOCATION_DATA__EDIT)
  update(
    @Req() { user }: JwtAuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStateDto: UpdateStateDto,
  ) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID not found');
    }

    return this.stateService.update(id, updateStateDto, user.organizationId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.LOCATION_DATA__EDIT)
  remove(@Req() { user }: JwtAuthRequest, @Param('id', ParseIntPipe) id: number) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID not found');
    }
    return this.stateService.remove(id, user.organizationId);
  }
}
