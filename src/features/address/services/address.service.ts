import { Injectable } from '@nestjs/common';
import { CreateAddressDto } from '../dto/requests/address/create-address.dto';
import { UpdateAddressDto } from '../dto/requests/address/update-address.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GetAddressesDto } from '../dto/query/get-addresses.dto';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}

  create(createAddressDto: CreateAddressDto, organizationId: number) {
    return this.prisma.address.create({
      data: { ...createAddressDto, organizationId },
    });
  }

  findAll(
    { skip, limit, search, townshipIds, cityIds, stateIds, countryIds }: GetAddressesDto,
    organizationId?: number,
  ) {
    const searchTerm = search?.trim();
    
    return this.prisma.address.findMany({
      skip,
      take: limit,
      where: {
        organizationId,
        // Search across address fields with OR logic
        ...(searchTerm && {
          OR: [
            { room: { contains: searchTerm, mode: 'insensitive' } },
            { building: { contains: searchTerm, mode: 'insensitive' } },
            { street: { contains: searchTerm, mode: 'insensitive' } },
            { road: { contains: searchTerm, mode: 'insensitive' } },
          ],
        }),
        // Filter by location hierarchy - only apply if arrays are provided and not empty
        ...(townshipIds?.length && { townshipId: { in: townshipIds } }),
        ...(cityIds?.length && {
          township: { cityId: { in: cityIds } },
        }),
        ...(stateIds?.length && {
          township: { city: { stateId: { in: stateIds } } },
        }),
        ...(countryIds?.length && {
          township: { city: { state: { countryId: { in: countryIds } } } },
        }),
      },
      include: {
        township: {
          include: {
            city: {
              include: {
                state: {
                  include: {
                    country: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  findOne(id: number, organizationId?: number) {
    return this.prisma.address.findUnique({ where: { id, organizationId } });
  }

  update(
    id: number,
    updateAddressDto: UpdateAddressDto,
    organizationId: number,
  ) {
    return this.prisma.address.update({
      where: { id, organizationId },
      data: updateAddressDto,
    });
  }

  remove(id: number, userId: number) {
    console.log('Address deleted by:', userId);
    return this.prisma.address.delete({ where: { id } });
  }
}
