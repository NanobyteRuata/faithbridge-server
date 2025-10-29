import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/request/create-profile.dto';
import { UpdateProfileDto } from './dto/request/update-profile.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GetProfilesDto } from './dto/query/get-profiles.dto';
import { Prisma } from '@prisma/client';

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

    return this.prisma.profile.create({
      data: {
        ...profileData,
        createdById: userId,
        updatedById: userId,
        organizationId,
        ...(addresses && addresses.length > 0 && {
          address: {
            create: addresses.map((addr) => ({
              ...addr,
              organizationId: organizationId!,
            })),
          },
        }),
      },
      include: {
        status: true,
        membership: true,
        ...addressInclude,
      },
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
        ...(townshipIds ? { townshipId: { in: townshipIds } } : {}),
        ...(!townshipIds && cityIds ? { cityId: { in: cityIds } } : {}),
        ...(!townshipIds && !cityIds && stateIds ? { stateId: { in: stateIds } } : {}),
        ...(!townshipIds && !cityIds && !stateIds && countryIds ? { countryId: { in: countryIds } } : {}),
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

    return {
      data: profiles,
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
      // If addresses are provided, handle create/update/delete
      if (addresses !== undefined) {
        const existingAddresses = await tx.address.findMany({
          where: { profiles: { some: { id } } },
          select: { id: true },
        });

        const incomingIds = addresses.filter((addr) => addr.id).map((addr) => addr.id!);
        const toDelete = existingAddresses.filter((addr) => !incomingIds.includes(addr.id));

        // Delete addresses not in the incoming array
        if (toDelete.length > 0) {
          await tx.address.deleteMany({
            where: { id: { in: toDelete.map((addr) => addr.id) } },
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
          await tx.address.createMany({
            data: toCreate.map((addr) => ({
              ...addr,
              organizationId: organizationId!,
            })),
          });

          // Connect new addresses to profile
          const newAddresses = await tx.address.findMany({
            where: {
              organizationId,
              id: { notIn: existingAddresses.map((a) => a.id) },
              profiles: { none: {} },
            },
            orderBy: { id: 'desc' },
            take: toCreate.length,
          });

          await tx.profile.update({
            where: { id },
            data: {
              address: {
                connect: newAddresses.map((addr) => ({ id: addr.id })),
              },
            },
          });
        }
      }

      // Update profile data
      return tx.profile.update({
        where: { id, organizationId },
        data: {
          ...profileData,
          updatedById: userId,
        },
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
}
