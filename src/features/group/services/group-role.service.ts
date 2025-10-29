import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateGroupRoleDto } from '../dto/request/group-role/create-group-role.dto';
import { UpdateGroupRoleDto } from '../dto/request/group-role/update-group-role.dto';
import { GetGroupRolesDto } from '../dto/query/get-group-roles.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GroupRoleService {
  constructor(private readonly prisma: PrismaService) {}

  create(
    createGroupRoleDto: CreateGroupRoleDto,
    userId: number,
    organizationId: number,
  ) {
    return this.prisma.groupRole.create({
      data: {
        ...createGroupRoleDto,
        organizationId,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll({ skip, limit, search, organizationId, groupTypeId }: GetGroupRolesDto) {
    const args: Prisma.GroupRoleFindManyArgs = {
      skip,
      take: limit,
      where: {
        organizationId,
        ...(groupTypeId && { groupTypeId }),
        OR: search?.trim()
          ? [
              { name: { contains: search.trim(), mode: 'insensitive' } },
              { code: { contains: search.trim(), mode: 'insensitive' } },
            ]
          : undefined,
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

    const [groupRoles, total] = await this.prisma.$transaction([
      this.prisma.groupRole.findMany(args),
      this.prisma.groupRole.count({ where: args.where }),
    ]);

    return {
      data: groupRoles,
      meta: {
        page: skip,
        limit,
        total,
      },
      success: true,
    };
  }

  findAllDropdown(organizationId: number, groupTypeId?: number) {
    return this.prisma.groupRole.findMany({
      where: { organizationId, ...(groupTypeId && { groupTypeId }) },
      select: { id: true, code: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number, userOrgId?: number) {
    const groupRole = await this.prisma.groupRole.findUnique({
      where: { id },
      include: {
        groupType: true,
        members: true,
      },
    });
    const isNotSameOrg = userOrgId && groupRole?.organizationId !== userOrgId;
    if (!groupRole || isNotSameOrg) {
      throw new BadRequestException('Group role not found');
    }

    return groupRole;
  }

  async update(
    id: number,
    updateGroupRoleDto: UpdateGroupRoleDto,
    userId: number,
    userOrgId?: number,
  ) {
    await this.findOne(id, userOrgId);

    return this.prisma.groupRole.update({
      where: { id },
      data: { ...updateGroupRoleDto, updatedById: userId },
    });
  }

  async remove(id: number, userId: number, userOrgId?: number) {
    await this.findOne(id, userOrgId);

    console.log(userId);
    return this.prisma.groupRole.delete({ where: { id } });
  }
}
