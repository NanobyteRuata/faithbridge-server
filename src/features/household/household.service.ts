import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateHouseholdDto } from './dto/request/create-household.dto';
import { UpdateHouseholdDto } from './dto/request/update-household.dto';
import { GetHouseholdsDto } from './dto/query/get-households.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class HouseholdService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createHouseholdDto: CreateHouseholdDto,
    userId: number,
    organizationId?: number,
  ) {
    const { memberProfileIds, ...householdData } = createHouseholdDto;

    // Validate head profile exists and belongs to organization
    if (householdData.headProfileId) {
      const headProfile = await this.prisma.profile.findFirst({
        where: {
          id: householdData.headProfileId,
          organizationId,
        },
      });

      if (!headProfile) {
        throw new BadRequestException('Head profile not found or does not belong to this organization');
      }
    }

    // Validate address exists and belongs to organization
    if (householdData.addressId) {
      const address = await this.prisma.address.findFirst({
        where: {
          id: householdData.addressId,
          organizationId,
        },
      });

      if (!address) {
        throw new BadRequestException('Address not found or does not belong to this organization');
      }
    }

    // Ensure head profile is included in members
    const allMemberIds = new Set(memberProfileIds || []);
    if (householdData.headProfileId) {
      allMemberIds.add(householdData.headProfileId);
    }

    // Create household with members
    return this.prisma.household.create({
      data: {
        name: householdData.name,
        description: householdData.description,
        organization: {
          connect: { id: organizationId },
        },
        ...(householdData.headProfileId && {
          headProfile: {
            connect: { id: householdData.headProfileId },
          },
        }),
        ...(householdData.addressId && {
          address: {
            connect: { id: householdData.addressId },
          },
        }),
        createdBy: {
          connect: { id: userId },
        },
        updatedBy: {
          connect: { id: userId },
        },
        ...(allMemberIds.size > 0 && {
          members: {
            connect: Array.from(allMemberIds).map((id) => ({ id })),
          },
        }),
      },
      include: {
        headProfile: true,
        address: {
          include: {
            township: {
              include: {
                city: {
                  include: {
                    state: {
                      include: {
                        country: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        members: true,
      },
    });
  }

  async findAll(
    { page, skip, limit, search }: GetHouseholdsDto,
    organizationId?: number,
  ) {
    const args: Prisma.HouseholdFindManyArgs = {
      skip,
      take: limit,
      where: {
        organizationId,
        ...(search && {
          name: {
            contains: search?.trim(),
            mode: 'insensitive',
          },
        }),
      },
      include: {
        headProfile: true,
        address: {
          include: {
            township: {
              include: {
                city: {
                  include: {
                    state: {
                      include: {
                        country: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        members: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    };

    const [households, total] = await this.prisma.$transaction([
      this.prisma.household.findMany(args),
      this.prisma.household.count({ where: args.where }),
    ]);

    return {
      data: households,
      meta: {
        page,
        limit,
        total,
      },
      success: true,
    };
  }

  async findAllDropdown({ search }: GetHouseholdsDto, organizationId?: number) {
    const args: Prisma.HouseholdFindManyArgs = {
      where: {
        organizationId,
        ...(search && {
          OR: [
            {
              name: {
                contains: search?.trim(),
                mode: 'insensitive',
              },
            },
            {
              headProfile: {
                name: {
                  contains: search?.trim(),
                  mode: 'insensitive',
                },
              },
            },
          ],
        }),
      },
      select: {
        id: true,
        name: true,
      },
    };

    return this.prisma.household.findMany(args);
  }

  async findOne(id: number, organizationId?: number) {
    const household = await this.prisma.household.findFirst({
      where: { id, organizationId },
      include: {
        headProfile: true,
        address: {
          include: {
            township: {
              include: {
                city: {
                  include: {
                    state: {
                      include: {
                        country: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        members: true,
      },
    });

    if (!household) {
      throw new BadRequestException('Household not found');
    }

    return household;
  }

  async update(
    id: number,
    updateHouseholdDto: UpdateHouseholdDto,
    userId: number,
    organizationId?: number,
  ) {
    await this.findOne(id, organizationId);

    const { memberProfileIds, ...householdData } = updateHouseholdDto;

    // Validate head profile if provided
    if (householdData.headProfileId) {
      const headProfile = await this.prisma.profile.findFirst({
        where: {
          id: householdData.headProfileId,
          organizationId,
        },
      });

      if (!headProfile) {
        throw new BadRequestException('Head profile not found or does not belong to this organization');
      }
    }

    // Validate address if provided
    if (householdData.addressId) {
      const address = await this.prisma.address.findFirst({
        where: {
          id: householdData.addressId,
          organizationId,
        },
      });

      if (!address) {
        throw new BadRequestException('Address not found or does not belong to this organization');
      }
    }

    // Ensure head profile is included in members if memberProfileIds is provided
    let finalMemberIds = memberProfileIds;
    if (memberProfileIds !== undefined) {
      const allMemberIds = new Set(memberProfileIds);
      
      // Get the new or existing head profile ID
      const headId = householdData.headProfileId !== undefined 
        ? householdData.headProfileId 
        : (await this.prisma.household.findUnique({ where: { id }, select: { headProfileId: true } }))?.headProfileId;
      
      if (headId) {
        allMemberIds.add(headId);
      }
      
      finalMemberIds = Array.from(allMemberIds);
    }

    // Update household
    return this.prisma.household.update({
      where: { id },
      data: {
        ...(householdData.name && { name: householdData.name }),
        ...(householdData.description !== undefined && { description: householdData.description }),
        ...(householdData.headProfileId !== undefined && {
          headProfile: householdData.headProfileId
            ? { connect: { id: householdData.headProfileId } }
            : { disconnect: true },
        }),
        ...(householdData.addressId !== undefined && {
          address: householdData.addressId
            ? { connect: { id: householdData.addressId } }
            : { disconnect: true },
        }),
        updatedBy: {
          connect: { id: userId },
        },
        ...(finalMemberIds !== undefined && {
          members: {
            set: finalMemberIds.map((profileId) => ({ id: profileId })),
          },
        }),
      },
      include: {
        headProfile: true,
        address: {
          include: {
            township: {
              include: {
                city: {
                  include: {
                    state: {
                      include: {
                        country: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        members: true,
      },
    });
  }

  async remove(id: number, userId: number, organizationId?: number) {
    await this.findOne(id, organizationId);

    console.warn('Household deleted by:', userId);
    return this.prisma.household.delete({ where: { id } });
  }

  async addMembers(
    householdId: number,
    profileIds: number[],
    updatedById: number,
    organizationId?: number,
  ) {
    return this.prisma.household.update({
      where: { id: householdId, organizationId },
      data: {
        members: {
          connect: profileIds.map((profileId) => ({ id: profileId })),
        },
        updatedBy: {
          connect: { id: updatedById },
        },
      },
    });
  }

  async removeMembers(
    householdId: number,
    profileIds: number[],
    updatedById: number,
    organizationId?: number,
  ) {
    return this.prisma.household.update({
      where: { id: householdId, organizationId },
      data: {
        members: {
          disconnect: profileIds.map((profileId) => ({ id: profileId })),
        },
        updatedBy: {
          connect: { id: updatedById },
        },
      },
    });
  }
}
