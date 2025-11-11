import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/request/create-profile.dto';
import { UpdateProfileDto } from './dto/request/update-profile.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GetProfilesDto } from './dto/query/get-profiles.dto';
import { Address, Prisma, Profile, User } from '@prisma/client';

export const addressInclude: Prisma.ProfileInclude = {
  addresses: {
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
};

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createProfileDto: CreateProfileDto,
    userId: number,
    organizationId?: number,
  ) {
    const { addresses, membershipId, statusId, householdId, groupId, ...profileData } =
      createProfileDto;

    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.profile.create({
        data: {
          ...profileData,
          organization: {
            connect: {
              id: organizationId,
            },
          },
          ...(membershipId && {
            membership: { connect: { id: membershipId } },
          }),
          ...(statusId && { status: { connect: { id: statusId } } }),
          ...(householdId && { household: { connect: { id: householdId } } }),
          ...(groupId && {
            groupMemberships: {
              create: {
                groupId: groupId,
                organizationId: organizationId!,
                createdById: userId,
                updatedById: userId,
              },
            },
          }),
          createdBy: {
            connect: {
              id: userId,
            },
          },
          updatedBy: {
            connect: {
              id: userId,
            },
          },
        },
      });

      // Create addresses if provided
      if (addresses && addresses.length > 0) {
        const createdAddresses = await tx.address.createManyAndReturn({
          data: addresses.map((addr) => ({
            ...addr,
            organizationId: organizationId!,
          })),
        });

        // Connect addresses to profile
        await tx.profile.update({
          where: { id: profile.id },
          data: {
            addresses: {
              connect: createdAddresses.map((addr) => ({ id: addr.id })),
            },
          },
        });
      }

      // Return the complete profile with relations
      return tx.profile.findUnique({
        where: { id: profile.id },
        include: {
          status: true,
          membership: true,
          ...addressInclude,
        },
      });
    });
  }

  async findAll(
    {
      page,
      skip,
      limit,
      search,
      membershipIds,
      statusIds,
      townshipIds,
      cityIds,
      stateIds,
      countryIds,
      householdIds,
      groupIds,
      isUser,
    }: GetProfilesDto,
    organizationId?: number,
  ) {
    const args: Prisma.ProfileFindManyArgs = {
      skip,
      take: limit,
      where: {
        ...(search && {
          OR: [
            {
              title: {
                contains: search?.trim(),
                mode: 'insensitive',
              },
            },
            {
              name: {
                contains: search?.trim(),
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: search?.trim(),
                mode: 'insensitive',
              },
            },
            {
              nickName: {
                contains: search?.trim(),
                mode: 'insensitive',
              },
            },
          ],
        }),
        organization: {
          id: organizationId,
        },
        ...(statusIds && {
          status: { isActiveStatus: true, id: { in: statusIds } },
        }),
        ...(membershipIds && {
          membership: { isActiveMembership: true, id: { in: membershipIds } },
        }),
        ...(townshipIds && {
          addresses: { every: { townshipId: { in: townshipIds } } },
        }),
        ...(!townshipIds &&
          cityIds && {
            addresses: { every: { township: { cityId: { in: cityIds } } } },
          }),
        ...(!townshipIds &&
          !cityIds &&
          stateIds && {
            addresses: {
              every: { township: { city: { stateId: { in: stateIds } } } },
            },
          }),
        ...(!townshipIds &&
          !cityIds &&
          !stateIds &&
          countryIds && {
            addresses: {
              every: {
                township: {
                  city: { state: { countryId: { in: countryIds } } },
                },
              },
            },
          }),
        ...(householdIds && {
          household: { id: { in: householdIds } },
        }),
        ...(groupIds && {
          groupMemberships: { some: { groupId: { in: groupIds } } },
        }),
        ...(isUser != null && {
          user: isUser ? { isNot: null } : { is: null },
        }),
      },
      include: {
        status: true,
        membership: true,
        user: true,
        household: {
          select: {
            id: true,
            name: true,
            description: true,
            headProfileId: true,
            addressId: true,
            members: true,
          },
        },
        ...addressInclude,
      },
    };

    const [profiles, total] = await this.prisma.$transaction([
      this.prisma.profile.findMany(args),
      this.prisma.profile.count({ where: args.where }),
    ]);

    const filteredProfiles = profiles.map((profile) => {
      const userId = (profile as Profile & { user?: User }).user?.id;
      return {
        ...this.filterPrivateFields(profile),
        userId,
      };
    });

    return {
      data: filteredProfiles,
      meta: {
        page,
        limit,
        total,
      },
      success: true,
    };
  }

  async findAllDropdown({ search }: GetProfilesDto, organizationId?: number) {
    return this.prisma.profile.findMany({
      where: { organizationId, ...(search && {
          OR: [
            {
              title: {
                contains: search?.trim(),
                mode: 'insensitive',
              },
            },
            {
              name: {
                contains: search?.trim(),
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: search?.trim(),
                mode: 'insensitive',
              },
            },
            {
              nickName: {
                contains: search?.trim(),
                mode: 'insensitive',
              },
            },
          ],
        }) },
      select: { id: true, name: true },
    });
  }

  async findOne(id: number, organizationId?: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { id, organizationId },
      include: {
        status: true,
        membership: true,
        user: true,
        household: {
          select: {
            id: true,
            name: true,
            description: true,
            headProfileId: true,
            addressId: true,
            members: true,
          },
        },
        ...addressInclude,
      },
    });

    const userId = (profile as Profile & { user?: User }).user?.id;
    return {
      ...this.filterPrivateFields(profile as Profile),
      userId,
    };
  }

  async update(
    id: number,
    updateProfileDto: UpdateProfileDto,
    userId: number,
    organizationId?: number,
  ) {
    const { addresses, membershipId, statusId, householdId, groupId, ...profileData } =
      updateProfileDto;

    return this.prisma.$transaction(async (tx) => {
      // Update profile data
      await tx.profile.update({
        where: { id, organizationId },
        data: {
          ...profileData,
          ...(groupId && {
            groupMemberships: {
              connectOrCreate: [
                {
                  where: {
                    profileId_groupId: {
                      profileId: id,
                      groupId,
                    },
                  },
                  create: {
                    groupId,
                    organizationId: organizationId!,
                    createdById: userId,
                    updatedById: userId,
                  },
                },
              ],
            },
          }),
          ...(membershipId !== undefined && { membershipId }),
          ...(statusId !== undefined && { statusId }),
          ...(householdId !== undefined && { householdId }),
          updatedById: userId,
        },
      });

      // Handle addresses if provided
      if (addresses !== undefined) {
        // Get existing addresses for this profile
        const existingAddresses = await tx.address.findMany({
          where: { profiles: { some: { id } } },
          select: { id: true },
        });

        const incomingIds = addresses
          .filter((addr) => addr.id)
          .map((addr) => addr.id!);
        const existingIds = existingAddresses.map((addr) => addr.id);

        // Delete addresses not in the incoming array
        const toDeleteIds = existingIds.filter(
          (existingId) => !incomingIds.includes(existingId),
        );
        if (toDeleteIds.length > 0) {
          // Disconnect from profile first, then delete
          await tx.profile.update({
            where: { id },
            data: {
              addresses: {
                disconnect: toDeleteIds.map((addrId) => ({ id: addrId })),
              },
            },
          });
          await tx.address.deleteMany({
            where: { id: { in: toDeleteIds } },
          });
        }

        // Update existing addresses
        const toUpdate = addresses.filter((addr) => addr.id);
        for (const addr of toUpdate) {
          const { id: addrId, ...addrData } = addr;
          await tx.address.update({
            where: { id: addrId },
            data: {
              ...addrData,
              ...(organizationId && { organizationId }),
            },
          });
        }

        // Create new addresses
        const toCreate = addresses.filter((addr) => !addr.id);
        if (toCreate.length > 0) {
          const createdAddresses = await tx.address.createManyAndReturn({
            data: toCreate.map((addr) => ({
              ...addr,
              organizationId: organizationId!,
            })),
          });

          // Connect new addresses to profile
          await tx.profile.update({
            where: { id },
            data: {
              addresses: {
                connect: createdAddresses.map((addr) => ({ id: addr.id })),
              },
            },
          });
        }
      }

      // Return the complete updated profile
      return tx.profile.findUnique({
        where: { id },
        include: {
          status: true,
          membership: true,
          ...addressInclude,
        },
      });
    });
  }

  remove(id: number, userId: number) {
    // TODO: use userId for activity logging later
    console.warn(userId);
    return this.prisma.profile.delete({ where: { id } });
  }

  private filterPrivateFields(profile: Profile & { addresses?: Address[] }) {
    const filtered: Profile & { addresses?: Address[] } = { ...profile };

    if (!profile.isPersonalEmailPublic) filtered.personalEmail = null;
    if (!profile.isWorkEmailPublic) filtered.workEmail = null;
    if (!profile.isPersonalPhonePublic) filtered.personalPhone = null;
    if (!profile.isHomePhonePublic) filtered.homePhone = null;
    if (!profile.isOtherContact1Public) {
      filtered.otherContact1 = null;
      filtered.otherContact1Type = null;
    }
    if (!profile.isOtherContact2Public) {
      filtered.otherContact2 = null;
      filtered.otherContact2Type = null;
    }
    if (!profile.isOtherContact3Public) {
      filtered.otherContact3 = null;
      filtered.otherContact3Type = null;
    }

    if (profile.addresses && profile.addresses.length > 0) {
      filtered.addresses = profile.addresses.filter(
        (address) => address.isPublic,
      );
    }

    return filtered;
  }
}
