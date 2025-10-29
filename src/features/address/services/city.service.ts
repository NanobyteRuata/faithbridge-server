import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateCityDto } from '../dto/requests/city/create-city.dto';
import { UpdateCityDto } from '../dto/requests/city/update-city.dto';
import { GetCitiesDto } from '../dto/query/get-cities.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CityService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCityDto: CreateCityDto, organizationId: number) {
    return this.prisma.city.create({
      data: { ...createCityDto, organizationId },
    });
  }

  async findAll({ skip, limit, search, organizationId, stateId }: GetCitiesDto) {
    const searchTerm = search?.trim();

    const args: Prisma.CityFindManyArgs = {
      skip,
      take: limit,
      where: {
        organizationId,
        ...(stateId && { stateId }),
        ...(searchTerm && {
          name: { contains: searchTerm, mode: 'insensitive' },
        }),
      },
      include: {
        state: {
          select: { id: true, name: true, country: { select: { id: true, name: true } } },
        },
        _count: {
          select: { townships: true },
        },
      },
      orderBy: { name: 'asc' },
    };

    const [cities, total] = await this.prisma.$transaction([
      this.prisma.city.findMany(args),
      this.prisma.city.count({ where: args.where }),
    ]);

    return {
      data: cities,
      meta: {
        page: skip,
        limit,
        total,
      },
      success: true,
    };
  }

  findAllDropdown(organizationId: number, stateIds?: number[]) {
    return this.prisma.city.findMany({
      where: { organizationId, stateId: { in: stateIds } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: number, organizationId?: number) {
    return this.prisma.city.findUnique({
      where: { id, organizationId },
      include: {
        state: {
          include: {
            country: true,
          },
        },
        townships: true,
      },
    });
  }

  update(id: number, updateCityDto: UpdateCityDto, organizationId: number) {
    return this.prisma.city.update({
      where: { id, organizationId },
      data: updateCityDto,
    });
  }

  remove(id: number, organizationId: number) {
    return this.prisma.city.delete({
      where: { id, organizationId },
    });
  }
}
