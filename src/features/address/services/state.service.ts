import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateStateDto } from '../dto/requests/state/create-state.dto';
import { UpdateStateDto } from '../dto/requests/state/update-state.dto';
import { GetStatesDto } from '../dto/query/get-states.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StateService {
  constructor(private readonly prisma: PrismaService) {}

  create(createStateDto: CreateStateDto, organizationId: number) {
    return this.prisma.state.create({
      data: { ...createStateDto, organizationId },
    });
  }

  async findAll({ skip, limit, search, organizationId, countryId }: GetStatesDto) {
    const searchTerm = search?.trim();
    
    const args: Prisma.StateFindManyArgs = {
      skip,
      take: limit,
      where: {
        organizationId,
        countryId,
        ...(searchTerm && {
          name: { contains: searchTerm, mode: 'insensitive' },
        }),
      },
      include: {
        _count: {
          select: { cities: true },
        },
      },
      orderBy: { name: 'asc' },
    };

    const [states, total] = await this.prisma.$transaction([
      this.prisma.state.findMany(args),
      this.prisma.state.count({ where: args.where }),
    ]);

    return {
      data: states,
      meta: {
        page: skip,
        limit,
        total,
      },
      success: true,
    };
  }

  findAllDropdown(organizationId: number, countryId: number) {
    return this.prisma.state.findMany({
      where: { organizationId, countryId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: number, organizationId?: number) {
    return this.prisma.state.findUnique({
      where: { id, organizationId },
      include: {
        country: true,
        cities: {
          include: {
            _count: {
              select: { townships: true },
            },
          },
        },
      },
    });
  }

  update(id: number, updateStateDto: UpdateStateDto, organizationId: number) {
    return this.prisma.state.update({
      where: { id, organizationId },
      data: updateStateDto,
    });
  }

  remove(id: number, organizationId: number) {
    return this.prisma.state.delete({
      where: { id, organizationId },
    });
  }
}
