import { Injectable } from '@nestjs/common';
import { CreateHouseholdDto } from './dto/request/create-household.dto';
import { UpdateHouseholdDto } from './dto/request/update-household.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GetHouseholdsDto } from './dto/query/get-households.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class HouseholdService {
  constructor(private readonly prisma: PrismaService) {}

  create(
    createHouseholdDto: CreateHouseholdDto,
    userId: number,
    organizationId: number,
  ) {
    return this.prisma.household.create({
      data: {
        ...createHouseholdDto,
        organizationId,
        profiles: {
          connect: createHouseholdDto.profileIds?.map((id) => ({ id })),
        },
        createdById: userId,
        updatedById: userId,
      },
      include: {
        address: true,
        headProfile: true,
        profiles: true,
      },
    });
  }

  async findAll({ skip, limit, search }: GetHouseholdsDto) {
    const args: Prisma.HouseholdFindManyArgs = {
      skip,
      take: limit,
      where: {
        name: {
          contains: search?.trim(),
          mode: 'insensitive',
        },
      },
    };

    const [households, total] = await this.prisma.$transaction([
      this.prisma.household.findMany(args),
      this.prisma.household.count({ where: args.where }),
    ]);

    return {
      data: households,
      meta: {
        page: skip,
        limit,
        total,
      },
      success: true,
    };
  }

  async findOne(id: number) {
    return this.prisma.household.findUnique({
      where: { id },
      include: {
        address: true,
        headProfile: true,
        profiles: true,
      },
    });
  }

  async update(
    id: number,
    updateHouseholdDto: UpdateHouseholdDto,
    userId: number,
  ) {
    return this.prisma.household.update({
      where: { id },
      data: {
        ...updateHouseholdDto,
        profiles: {
          set: updateHouseholdDto.profileIds?.map((id) => ({ id })),
        },
        updatedById: userId,
      },
      include: {
        address: true,
        headProfile: true,
        profiles: true,
      },
    });
  }

  async remove(id: number, userId: number) {
    // TODO: use userId for activity logging later
    console.log(userId);
    return this.prisma.household.delete({
      where: { id },
    });
  }
}
