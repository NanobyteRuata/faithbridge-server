import { Injectable } from '@nestjs/common';
import { CreateMembershipDto } from './dto/request/create-membership.dto';
import { UpdateMembershipDto } from './dto/request/update-membership.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GetMembershipsDto } from './dto/query/get-memberships.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MembershipService {
  constructor(private readonly prisma: PrismaService) {}

  create(
    createMembershipDto: CreateMembershipDto,
    userId: number,
    organizationId: number,
  ) {
    return this.prisma.membership.create({
      data: {
        ...createMembershipDto,
        organizationId,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll({ skip, limit, search }: GetMembershipsDto) {
    const args: Prisma.MembershipFindManyArgs = {
      skip,
      take: limit,
      where: {
        name: {
          contains: search?.trim(),
          mode: 'insensitive',
        },
      },
    };

    const [memberships, total] = await this.prisma.$transaction([
      this.prisma.membership.findMany(args),
      this.prisma.membership.count({ where: args.where }),
    ]);

    return {
      data: memberships,
      meta: {
        page: skip,
        limit,
        total,
      },
      success: true,
    };
  }

  async findOne(id: number) {
    return this.prisma.membership.findUnique({ where: { id } });
  }

  async update(
    id: number,
    updateMembershipDto: UpdateMembershipDto,
    userId: number,
  ) {
    return this.prisma.membership.update({
      where: { id },
      data: { ...updateMembershipDto, updatedById: userId },
    });
  }

  async remove(id: number, userId: number) {
    // TODO: use userId for activity logging later
    console.log(userId);
    return this.prisma.membership.delete({ where: { id } });
  }
}
