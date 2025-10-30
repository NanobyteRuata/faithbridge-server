import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/request/create-profile.dto';
import { UpdateProfileDto } from './dto/request/update-profile.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GetProfilesDto } from './dto/query/get-profiles.dto';
import { Address, Prisma, Profile } from '@prisma/client';

const addressInclude = {
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
};

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProfileDto: CreateProfileDto, userId: number, organizationId?: number) {
    const { addresses, ...profileData } = createProfileDto;

    return this.prisma.$transaction(async (tx) => {
      // Create the profile first
      const profile = await tx.profile.create({
        data: {
          ...profileData,
          createdById: userId,
          updatedById: userId,
          organizationId,
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

  async findAll({ skip, limit, search, membershipIds, statusIds, townshipIds, cityIds, stateIds, countryIds }: GetProfilesDto, organizationId?: number) {
    const args: Prisma.ProfileFindManyArgs = {
      skip,
      take: limit,
      where: {
        name: {
          contains: search?.trim(),
          mode: 'insensitive',
        },
        organizationId,
        ...(statusIds ? { statusId: { in: statusIds } } : { status: { isActiveStatus: true } }),
        ...(membershipIds ? { membershipId: { in: membershipIds } } : { membership: { isActiveMembership: true } }),
        ...(townshipIds ? { address: { every: { townshipId: { in: townshipIds } } } } : {}),
        ...(!townshipIds && cityIds ? { address: { every: { township: { cityId: { in: cityIds } } } } } : {}),
        ...(!townshipIds && !cityIds && stateIds ? { address: { every: { township: { city: { stateId: { in: stateIds } } } } } } : {}),
        ...(!townshipIds && !cityIds && !stateIds && countryIds ? { address: { every: { township: { city: { state: { countryId: { in: countryIds } } } } } } } : {}),
      },
      include: {
        status: true,
        membership: true,
        ...addressInclude,
      },
    };

    const [profiles, total] = await this.prisma.$transaction([
      this.prisma.profile.findMany(args),
      this.prisma.profile.count({ where: args.where }),
    ]);

    const filteredProfiles = profiles.map((profile) => this.filterPrivateFields(profile));

    return {
      data: filteredProfiles,
      meta: {
        page: skip,
        limit,
        total,
      },
      success: true,
    };
  }

  findOne(id: number, organizationId?: number) {
    return this.prisma.profile.findUnique({
      where: { id, organizationId },
      include: {
        status: true,
        membership: true,
        ...addressInclude,
      },
    });
  }

  async update(id: number, updateProfileDto: UpdateProfileDto, userId: number, organizationId?: number) {
    const { addresses, ...profileData } = updateProfileDto;

    return this.prisma.$transaction(async (tx) => {
      // Update profile data
      await tx.profile.update({
        where: { id, organizationId },
        data: {
          ...profileData,
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

        const incomingIds = addresses.filter((addr) => addr.id).map((addr) => addr.id!);
        const existingIds = existingAddresses.map((addr) => addr.id);

        // Delete addresses not in the incoming array
        const toDeleteIds = existingIds.filter((existingId) => !incomingIds.includes(existingId));
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
            data: addrData,
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
    console.log(userId);
    return this.prisma.profile.delete({ where: { id } });
  }

  private filterPrivateFields(profile: Profile & { addresses?: Address[] }) {
    const filtered: Partial<Profile & { addresses?: Address[] }> = { ...profile };

    if (!profile.isPersonalEmailPublic) delete filtered.personalEmail;
    if (!profile.isWorkEmailPublic) delete filtered.workEmail;
    if (!profile.isPersonalPhonePublic) delete filtered.personalPhone;
    if (!profile.isHomePhonePublic) delete filtered.homePhone;
    if (!profile.isOtherContact1Public) {
      delete filtered.otherContact1;
      delete filtered.otherContact1Type;
    }
    if (!profile.isOtherContact2Public) {
      delete filtered.otherContact2;
      delete filtered.otherContact2Type;
    }
    if (!profile.isOtherContact3Public) {
      delete filtered.otherContact3;
      delete filtered.otherContact3Type;
    }

    if (profile.addresses && profile.addresses.length > 0) {
      filtered.addresses = profile.addresses.filter((address) => address.isPublic);
    }

    return filtered;
  }
}
