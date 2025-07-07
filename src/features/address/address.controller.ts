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
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/request/create-address.dto';
import { UpdateAddressDto } from './dto/request/update-address.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { GetAddressesDto } from './dto/query/get-addresses.dto';

@Controller('address')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @Permissions(PERMISSIONS.ADDRESS__CREATE)
  create(@Body() createAddressDto: CreateAddressDto) {
    return this.addressService.create(createAddressDto);
  }

  @Get()
  @Permissions(PERMISSIONS.ADDRESS__READ)
  findAll(@Query() query: GetAddressesDto) {
    return this.addressService.findAll(query);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.ADDRESS__READ)
  findOne(@Param('id') id: string) {
    return this.addressService.findOne(+id);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.ADDRESS__UPDATE)
  update(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressService.update(+id, updateAddressDto);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.ADDRESS__DELETE)
  remove(@Param('id') id: string) {
    return this.addressService.remove(+id);
  }
}
