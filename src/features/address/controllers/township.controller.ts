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
  ParseArrayPipe,
} from '@nestjs/common';
import { TownshipService } from '../services/township.service';
import { CreateTownshipDto } from '../dto/requests/township/create-township.dto';
import { UpdateTownshipDto } from '../dto/requests/township/update-township.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { GetTownshipsDto } from '../dto/query/get-townships.dto';
import { HybridAuthRequest, JwtAuthRequest } from '../../user/interface/requests.interface';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { HybridAuthGuard } from 'src/core/auth/guards/hybrid-auth.guard';

@Controller('township')
export class TownshipController {
  constructor(private readonly townshipService: TownshipService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.LOCATION_DATA__EDIT)
  create(
    @Req() { user }: JwtAuthRequest,
    @Body() createTownshipDto: CreateTownshipDto,
  ) {
    const organizationId = user.organizationId || createTownshipDto.organizationId;
    if (!organizationId) {
      throw new BadRequestException('Organization ID not found');
    }

    return this.townshipService.create(createTownshipDto, organizationId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.LOCATION_DATA__VIEW)
  findAll(@Req() { user }: JwtAuthRequest, @Query() query: GetTownshipsDto) {
    if (user.organizationId) {
      query.organizationId = user.organizationId;
    }
    return this.townshipService.findAll(query);
  }

  @Get('dropdown')
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  findAllDropdown(
    @Req() { user }: HybridAuthRequest,
    @Query('cityIds', new ParseArrayPipe({ items: Number, optional: true })) cityIds?: number[],
    @Query('stateIds', new ParseArrayPipe({ items: Number, optional: true })) stateIds?: number[],
    @Query('countryIds', new ParseArrayPipe({ items: Number, optional: true })) countryIds?: number[],
  ) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID is required');
    }
    return this.townshipService.findAllDropdown(user.organizationId, cityIds, stateIds, countryIds);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.LOCATION_DATA__VIEW)
  findOne(@Req() { user }: JwtAuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.townshipService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.LOCATION_DATA__EDIT)
  update(
    @Req() { user }: JwtAuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTownshipDto: UpdateTownshipDto,
  ) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID not found');
    }

    return this.townshipService.update(id, updateTownshipDto, user.organizationId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.LOCATION_DATA__EDIT)
  remove(@Req() { user }: JwtAuthRequest, @Param('id', ParseIntPipe) id: number) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID not found');
    }
    return this.townshipService.remove(id, user.organizationId);
  }
}
