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
import { CountryService } from '../services/country.service';
import { CreateCountryDto } from '../dto/requests/country/create-country.dto';
import { UpdateCountryDto } from '../dto/requests/country/update-country.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { GetCountriesDto } from '../dto/query/get-countries.dto';
import { HybridAuthRequest, JwtAuthRequest } from '../../user/interface/requests.interface';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { HybridAuthGuard } from 'src/core/auth/guards/hybrid-auth.guard';

@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.LOCATION_DATA__EDIT)
  create(
    @Req() { user }: JwtAuthRequest,
    @Body() createCountryDto: CreateCountryDto,
  ) {
    const organizationId = user.organizationId || createCountryDto.organizationId;
    if (!organizationId) {
      throw new BadRequestException('Organization ID not found');
    }

    return this.countryService.create(createCountryDto, organizationId);
  }

  @Get()
  @UseGuards(HybridAuthGuard)
  findAll(@Req() { user }: HybridAuthRequest, @Query() query: GetCountriesDto) {
    if (user.organizationId) {
      query.organizationId = user.organizationId;
    }
    return this.countryService.findAll(query);
  }

  @Get('dropdown')
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  findAllDropdown(@Req() { user }: HybridAuthRequest) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID is required');
    }
    return this.countryService.findAllDropdown(user.organizationId);
  }

  @Get(':id')
  @UseGuards(HybridAuthGuard)
  findOne(@Req() { user }: HybridAuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.countryService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.LOCATION_DATA__EDIT)
  update(
    @Req() { user }: JwtAuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCountryDto: UpdateCountryDto,
  ) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID not found');
    }

    return this.countryService.update(id, updateCountryDto, user.organizationId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.LOCATION_DATA__EDIT)
  remove(@Req() { user }: JwtAuthRequest, @Param('id', ParseIntPipe) id: number) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID not found');
    }
    return this.countryService.remove(id, user.organizationId);
  }
}