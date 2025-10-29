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
import { CityService } from '../services/city.service';
import { CreateCityDto } from '../dto/requests/city/create-city.dto';
import { UpdateCityDto } from '../dto/requests/city/update-city.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { GetCitiesDto } from '../dto/query/get-cities.dto';
import { HybridAuthRequest, JwtAuthRequest } from '../../user/interface/requests.interface';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { HybridAuthGuard } from 'src/core/auth/guards/hybrid-auth.guard';

@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.LOCATION_DATA__EDIT)
  create(
    @Req() { user }: JwtAuthRequest,
    @Body() createCityDto: CreateCityDto,
  ) {
    const organizationId = user.organizationId || createCityDto.organizationId;
    if (!organizationId) {
      throw new BadRequestException('Organization ID not found');
    }

    return this.cityService.create(createCityDto, organizationId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.LOCATION_DATA__VIEW)
  findAll(@Req() { user }: JwtAuthRequest, @Query() query: GetCitiesDto) {
    if (user.organizationId) {
      query.organizationId = user.organizationId;
    }
    return this.cityService.findAll(query);
  }

  @Get('dropdown')
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(
    PERMISSIONS.PROFILE__VIEW,
    PERMISSIONS.PROFILE__EDIT,
  )
  findAllDropdown(
    @Req() { user }: HybridAuthRequest,
    @Query('stateIds') stateIds?: string[],
  ) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID is required');
    }
    return this.cityService.findAllDropdown(user.organizationId, stateIds?.map(Number));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(
    PERMISSIONS.PROFILE__VIEW,
    PERMISSIONS.PROFILE__EDIT,
  )
  findOne(
    @Req() { user }: JwtAuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cityService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.LOCATION_DATA__EDIT)
  update(
    @Req() { user }: JwtAuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCityDto: UpdateCityDto,
  ) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID not found');
    }

    return this.cityService.update(id, updateCityDto, user.organizationId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.LOCATION_DATA__EDIT)
  remove(
    @Req() { user }: JwtAuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID not found');
    }
    return this.cityService.remove(id, user.organizationId);
  }
}
