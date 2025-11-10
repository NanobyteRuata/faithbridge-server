import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateGroupTypeDto } from '../dto/request/group-type/create-group-type.dto';
import { UpdateGroupTypeDto } from '../dto/request/group-type/update-group-type.dto';
import { GetGroupTypesDto } from '../dto/query/get-group-types.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GroupTypeService {
  constructor(private readonly prisma: PrismaService) {}

  create(
    createGroupTypeDto: CreateGroupTypeDto,
    userId: number,
    organizationId: number,
  ) {
    return this.prisma.groupType.create({
      data: {
        ...createGroupTypeDto,
        organizationId,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll({ skip, limit, search, organizationId }: GetGroupTypesDto) {
    const args: Prisma.GroupTypeFindManyArgs = {
      skip,
      take: limit,
      where: {
        organizationId,
        OR: search?.trim()
          ? [
              { name: { contains: search.trim(), mode: 'insensitive' } },
              { code: { contains: search.trim(), mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: {
        _count: {
          select: { groups: true, roles: true },
        },
      },
      orderBy: { name: 'asc' },
    };

    const [groupTypes, total] = await this.prisma.$transaction([
      this.prisma.groupType.findMany(args),
      this.prisma.groupType.count({ where: args.where }),
    ]);

    return {
      data: groupTypes,
      meta: {
        page: skip,
        limit,
        total,
      },
      success: true,
    };
  }

  findAllDropdown(organizationId: number) {
    return this.prisma.groupType.findMany({
      where: { organizationId },
      select: { id: true, code: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number, userOrgId?: number) {
    const groupType = await this.prisma.groupType.findUnique({
      where: { id },
      include: {
        groups: true,
        roles: true,
      },
    });
    const isNotSameOrg = userOrgId && groupType?.organizationId !== userOrgId;
    if (!groupType || isNotSameOrg) {
      throw new BadRequestException('Group type not found');
    }

    return groupType;
  }

  async update(
    id: number,
    updateGroupTypeDto: UpdateGroupTypeDto,
    userId: number,
    userOrgId?: number,
  ) {
    await this.findOne(id, userOrgId);

    return this.prisma.groupType.update({
      where: { id },
      data: { ...updateGroupTypeDto, updatedById: userId },
    });
  }

  async remove(id: number, userId: number, userOrgId?: number) {
    await this.findOne(id, userOrgId);

    console.warn(userId);
    return this.prisma.groupType.delete({ where: { id } });
  }
}
