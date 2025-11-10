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
import { AddressService } from '../services/address.service';
import { CreateAddressDto } from '../dto/requests/address/create-address.dto';
import { UpdateAddressDto } from '../dto/requests/address/update-address.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { GetAddressesDto } from '../dto/query/get-addresses.dto';
import { HybridAuthRequest, JwtAuthRequest } from '../../user/interface/requests.interface';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { HybridAuthGuard } from 'src/core/auth/guards/hybrid-auth.guard';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.PROFILE__EDIT)
  create(
    @Req() { user }: JwtAuthRequest,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    const organizationId = user.organizationId || createAddressDto.organizationId;
    if (!organizationId) {
      throw new BadRequestException('Organization ID not found');
    }

    return this.addressService.create(createAddressDto, organizationId);
  }

  @Get()
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  findAll(@Req() { user }: HybridAuthRequest, @Query() query: GetAddressesDto) {
    return this.addressService.findAll(query, user.organizationId);
  }

  @Get(':id')
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  findOne(@Req() { user }: HybridAuthRequest, @Param('id') id: string) {
    return this.addressService.findOne(+id, user.organizationId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.PROFILE__EDIT)
  update(
    @Req() { user }: JwtAuthRequest,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID not found');
    }

    return this.addressService.update(
      +id,
      updateAddressDto,
      user.organizationId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.PROFILE__EDIT)
  remove(@Req() { user }: JwtAuthRequest, @Param('id') id: string) {
    return this.addressService.remove(+id, user.sub);
  }
}
