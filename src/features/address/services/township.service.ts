import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateTownshipDto } from '../dto/requests/township/create-township.dto';
import { UpdateTownshipDto } from '../dto/requests/township/update-township.dto';
import { GetTownshipsDto } from '../dto/query/get-townships.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TownshipService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTownshipDto: CreateTownshipDto, organizationId: number) {
    return this.prisma.township.create({
      data: { ...createTownshipDto, organizationId },
    });
  }

  async findAll({ skip, limit, search, organizationId, cityId }: GetTownshipsDto) {
    const searchTerm = search?.trim();

    const args: Prisma.TownshipFindManyArgs = {
      skip,
      take: limit,
      where: {
        organizationId,
        ...(cityId && { cityId }),
        ...(searchTerm && {
          name: { contains: searchTerm, mode: 'insensitive' },
        }),
      },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            state: {
              select: { id: true, name: true, country: { select: { id: true, name: true } } },
            },
          },
        },
        _count: {
          select: { addresses: true },
        },
      },
      orderBy: { name: 'asc' },
    };

    const [townships, total] = await this.prisma.$transaction([
      this.prisma.township.findMany(args),
      this.prisma.township.count({ where: args.where }),
    ]);

    return {
      data: townships,
      meta: {
        page: skip,
        limit,
        total,
      },
      success: true,
    };
  }

  findAllDropdown(organizationId: number, cityIds?: number[], stateIds?: number[], countryIds?: number[]) {
    return this.prisma.township.findMany({
      where: {
        organizationId,
        cityId: { in: cityIds },
        ...(!cityIds?.length && stateIds?.length ? { city: { stateId: { in: stateIds } } } : {}),
        ...(!cityIds?.length && !stateIds?.length && countryIds?.length ? { city: { state: { countryId: { in: countryIds } } } } : {}),
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: number, organizationId?: number) {
    return this.prisma.township.findUnique({
      where: { id, organizationId },
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
        addresses: true,
      },
    });
  }

  update(id: number, updateTownshipDto: UpdateTownshipDto, organizationId: number) {
    return this.prisma.township.update({
      where: { id, organizationId },
      data: updateTownshipDto,
    });
  }

  remove(id: number, organizationId: number) {
    return this.prisma.township.delete({
      where: { id, organizationId },
    });
  }
}
