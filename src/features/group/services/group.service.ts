import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateGroupDto } from '../dto/request/group/create-group.dto';
import { UpdateGroupDto } from '../dto/request/group/update-group.dto';
import { GetProfileGroupsDto } from '../dto/query/get-profile-groups.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  create(
    createProfileGroupDto: CreateGroupDto,
    userId: number,
    organizationId: number,
  ) {
    return this.prisma.group.create({
      data: {
        ...createProfileGroupDto,
        organizationId,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll({ skip, limit, search, organizationId, groupTypeId }: GetProfileGroupsDto) {
    const args: Prisma.GroupFindManyArgs = {
      skip,
      take: limit,
      where: {
        organizationId,
        ...(groupTypeId && { groupTypeId }),
        ...(search?.trim() && {
          name: { contains: search.trim(), mode: 'insensitive' },
        }),
      },
      include: {
        groupType: {
          select: { id: true, code: true, name: true },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { name: 'asc' },
    };

    const [profileGroups, total] = await this.prisma.$transaction([
      this.prisma.group.findMany(args),
      this.prisma.group.count({ where: args.where }),
    ]);

    return {
      data: profileGroups,
      meta: {
        page: skip,
        limit,
        total,
      },
      success: true,
    };
  }

  findAllDropdown(organizationId: number, groupTypeId?: number) {
    return this.prisma.group.findMany({
      where: { organizationId, ...(groupTypeId && { groupTypeId }) },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number, userOrgId?: number) {
    const profileGroup = await this.prisma.group.findUnique({
      where: { id },
      include: {
        groupType: true,
        members: {
          include: {
            profile: {
              select: { id: true, name: true, lastName: true },
            },
            groupRole: {
              select: { id: true, code: true, name: true },
            },
          },
        },
      },
    });
    const isNotSameOrg = userOrgId && profileGroup?.organizationId !== userOrgId;
    if (!profileGroup || isNotSameOrg) {
      throw new BadRequestException('Profile group not found');
    }

    return profileGroup;
  }

  async update(
    id: number,
    updateProfileGroupDto: UpdateGroupDto,
    userId: number,
    userOrgId?: number,
  ) {
    await this.findOne(id, userOrgId);

    return this.prisma.group.update({
      where: { id },
      data: { ...updateProfileGroupDto, updatedById: userId },
    });
  }

  async remove(id: number, userId: number, userOrgId?: number) {
    await this.findOne(id, userOrgId);

    console.warn(userId);
    return this.prisma.group.delete({ where: { id } });
  }
}
