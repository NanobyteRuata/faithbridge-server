import { Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/request/create-address.dto';
import { UpdateAddressDto } from './dto/request/update-address.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GetAddressesDto } from './dto/query/get-addresses.dto';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}

  create(createAddressDto: CreateAddressDto, organizationId: number) {
    return this.prisma.address.create({ data: { ... createAddressDto, organizationId } });
  }

  findAll({
    skip,
    limit,
    search,
    township,
    city,
    state,
    country,
  }: GetAddressesDto,
organizationId?: number) {
    return this.prisma.address.findMany({
      skip,
      take: limit,
      where: {
        organizationId,
        room: {
          contains: search?.trim(),
          mode: 'insensitive',
        },
        building: {
          contains: search?.trim(),
          mode: 'insensitive',
        },
        street: {
          contains: search?.trim(),
          mode: 'insensitive',
        },
        township: {
          contains: search?.trim() || township,
          mode: 'insensitive',
        },
        city: {
          contains: search?.trim() || city,
          mode: 'insensitive',
        },
        state: {
          contains: search?.trim() || state,
          mode: 'insensitive',
        },
        zip: {
          contains: search?.trim(),
          mode: 'insensitive',
        },
        country: {
          contains: search?.trim() || country,
          mode: 'insensitive',
        },
      },
    });
  }

  findOne(id: number, organizationId?: number) {
    return this.prisma.address.findUnique({ where: { id, organizationId } });
  }

  update(id: number, updateAddressDto: UpdateAddressDto, organizationId: number) {
    return this.prisma.address.update({
      where: { id, organizationId },
      data: updateAddressDto,
    });
  }

  remove(id: number) {
    return this.prisma.address.delete({ where: { id } });
  }
}
