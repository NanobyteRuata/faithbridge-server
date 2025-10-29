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
import { JwtAuthRequest } from '../../user/interface/requests.interface';

@Controller('address')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @Permissions('SUPER_ADMIN')
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
  @Permissions('SUPER_ADMIN')
  findAll(@Req() { user }: JwtAuthRequest, @Query() query: GetAddressesDto) {
    return this.addressService.findAll(query, user.organizationId);
  }

  @Get(':id')
  @Permissions('SUPER_ADMIN')
  findOne(@Req() { user }: JwtAuthRequest, @Param('id') id: string) {
    return this.addressService.findOne(+id, user.organizationId);
  }

  @Patch(':id')
  @Permissions('SUPER_ADMIN')
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
  @Permissions('SUPER_ADMIN')
  remove(@Req() { user }: JwtAuthRequest, @Param('id') id: string) {
    return this.addressService.remove(+id, user.sub);
  }
}
