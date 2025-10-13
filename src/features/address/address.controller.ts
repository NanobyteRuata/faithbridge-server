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
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/request/create-address.dto';
import { UpdateAddressDto } from './dto/request/update-address.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { GetAddressesDto } from './dto/query/get-addresses.dto';
import { JwtAuthRequest } from '../user/interface/requests.interface';

@Controller('address')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @Permissions(PERMISSIONS.ADDRESS__CREATE)
  create(
    @Req() { user }: JwtAuthRequest,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization ID not found');
    }

    return this.addressService.create(createAddressDto, user.organizationId);
  }

  @Get()
  @Permissions(PERMISSIONS.ADDRESS__READ)
  findAll(@Req() { user }: JwtAuthRequest, @Query() query: GetAddressesDto) {
    return this.addressService.findAll(query, user.organizationId);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.ADDRESS__READ)
  findOne(@Req() { user }: JwtAuthRequest, @Param('id') id: string) {
    return this.addressService.findOne(+id, user.organizationId);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.ADDRESS__UPDATE)
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
  @Permissions(PERMISSIONS.ADDRESS__DELETE)
  remove(@Req() { user }: JwtAuthRequest, @Param('id') id: string) {
    return this.addressService.remove(+id, user.sub);
  }
}
