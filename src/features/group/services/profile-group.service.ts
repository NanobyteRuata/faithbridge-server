import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateProfileGroupDto } from '../dto/request/profile-group/create-profile-group.dto';
import { UpdateProfileGroupDto } from '../dto/request/profile-group/update-profile-group.dto';
import { GetProfileGroupsDto } from '../dto/query/get-profile-groups.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProfileGroupService {
  constructor(private readonly prisma: PrismaService) {}

  create(
    createProfileGroupDto: CreateProfileGroupDto,
    userId: number,
    organizationId: number,
  ) {
    return this.prisma.profileGroup.create({
      data: {
        ...createProfileGroupDto,
        organizationId,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll({ skip, limit, search, organizationId, groupTypeId }: GetProfileGroupsDto) {
    const args: Prisma.ProfileGroupFindManyArgs = {
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
      this.prisma.profileGroup.findMany(args),
      this.prisma.profileGroup.count({ where: args.where }),
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
    return this.prisma.profileGroup.findMany({
      where: { organizationId, ...(groupTypeId && { groupTypeId }) },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number, userOrgId?: number) {
    const profileGroup = await this.prisma.profileGroup.findUnique({
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
    updateProfileGroupDto: UpdateProfileGroupDto,
    userId: number,
    userOrgId?: number,
  ) {
    await this.findOne(id, userOrgId);

    return this.prisma.profileGroup.update({
      where: { id },
      data: { ...updateProfileGroupDto, updatedById: userId },
    });
  }

  async remove(id: number, userId: number, userOrgId?: number) {
    await this.findOne(id, userOrgId);

    console.log(userId);
    return this.prisma.profileGroup.delete({ where: { id } });
  }
}
