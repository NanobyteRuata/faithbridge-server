import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateProfileGroupMemberDto } from '../dto/request/profile-group-member/create-profile-group-member.dto';
import { UpdateProfileGroupMemberDto } from '../dto/request/profile-group-member/update-profile-group-member.dto';
import { GetProfileGroupMembersDto } from '../dto/query/get-profile-group-members.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProfileGroupMemberService {
  constructor(private readonly prisma: PrismaService) {}

  create(
    createProfileGroupMemberDto: CreateProfileGroupMemberDto,
    userId: number,
    organizationId: number,
  ) {
    return this.prisma.groupProfile.create({
      data: {
        ...createProfileGroupMemberDto,
        organizationId,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll({
    skip,
    limit,
    search,
    organizationId,
    groupId,
    profileId,
    groupRoleId,
  }: GetProfileGroupMembersDto) {
    const args: Prisma.GroupProfileFindManyArgs = {
      skip,
      take: limit,
      where: {
        organizationId,
        ...(groupId && { groupId }),
        ...(profileId && { profileId }),
        ...(groupRoleId && { groupRoleId }),
        ...(search?.trim() && {
          profile: {
            OR: [
              { name: { contains: search.trim(), mode: 'insensitive' } },
              { lastName: { contains: search.trim(), mode: 'insensitive' } },
            ],
          },
        }),
      },
      include: {
        profile: {
          select: { id: true, name: true, lastName: true, nickName: true },
        },
        group: {
          select: { id: true, name: true },
        },
        groupRole: {
          select: { id: true, code: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    };

    const [members, total] = await this.prisma.$transaction([
      this.prisma.groupProfile.findMany(args),
      this.prisma.groupProfile.count({ where: args.where }),
    ]);

    return {
      data: members,
      meta: {
        page: skip,
        limit,
        total,
      },
      success: true,
    };
  }

  async findOne(id: number, userOrgId?: number) {
    const member = await this.prisma.groupProfile.findUnique({
      where: { id },
      include: {
        profile: {
          select: { id: true, name: true, lastName: true, nickName: true },
        },
        group: {
          select: { id: true, name: true },
        },
        groupRole: {
          select: { id: true, code: true, name: true },
        },
      },
    });
    const isNotSameOrg = userOrgId && member?.organizationId !== userOrgId;
    if (!member || isNotSameOrg) {
      throw new BadRequestException('Profile group member not found');
    }

    return member;
  }

  async update(
    id: number,
    updateProfileGroupMemberDto: UpdateProfileGroupMemberDto,
    userId: number,
    userOrgId?: number,
  ) {
    await this.findOne(id, userOrgId);

    return this.prisma.groupProfile.update({
      where: { id },
      data: { ...updateProfileGroupMemberDto, updatedById: userId },
    });
  }

  async remove(id: number, userId: number, userOrgId?: number) {
    await this.findOne(id, userOrgId);

    console.warn(userId);
    return this.prisma.groupProfile.delete({ where: { id } });
  }
}
