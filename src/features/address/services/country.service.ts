import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateCountryDto } from '../dto/requests/country/create-country.dto';
import { UpdateCountryDto } from '../dto/requests/country/update-country.dto';
import { GetCountriesDto } from '../dto/query/get-countries.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CountryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCountryDto: CreateCountryDto, organizationId: number) {
    const country = await this.prisma.country.create({
      data: { ...createCountryDto, organizationId },
    });

    // Create default unknown state for the country
    await this.prisma.state.create({
      data: {
        name: 'Unknown',
        organizationId,
        countryId: country.id,
      },
    });

    return country;
  }

  async findAll({ skip, limit, search, organizationId }: GetCountriesDto) {
    const searchTerm = search?.trim();

    const args: Prisma.CountryFindManyArgs = {
      skip,
      take: limit,
      where: {
        organizationId,
        ...(searchTerm && {
          name: { contains: searchTerm, mode: 'insensitive' },
        }),
      },
      include: {
        _count: {
          select: { states: true },
        },
      },
      orderBy: { name: 'asc' },
    };

    const [countries, total] = await this.prisma.$transaction([
      this.prisma.country.findMany(args),
      this.prisma.country.count({ where: args.where }),
    ]);

    return {
      data: countries,
      meta: {
        page: skip,
        limit,
        total,
      },
      success: true,
    };
  }

  findAllDropdown(organizationId: number) {
    return this.prisma.country.findMany({
      where: { organizationId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: number, organizationId?: number) {
    return this.prisma.country.findUnique({
      where: { id, organizationId },
      include: {
        states: {
          include: {
            _count: {
              select: { cities: true },
            },
          },
        },
      },
    });
  }

  update(id: number, updateCountryDto: UpdateCountryDto, organizationId: number) {
    return this.prisma.country.update({
      where: { id, organizationId },
      data: updateCountryDto,
    });
  }

  remove(id: number, organizationId: number) {
    return this.prisma.country.delete({
      where: { id, organizationId },
    });
  }
}