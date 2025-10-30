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
    return this.prisma.profile.create({
      data: {
        ...createProfileDto,
        createdById: userId,
        updatedById: userId,
        organizationId,
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
    return this.prisma.profile.update({
      where: { id, organizationId },
      data: {
        ...updateProfileDto,
          updatedById: userId,
      },
      include: {
        status: true,
        membership: true,
        ...addressInclude,
      },
    });
  }

  remove(id: number, userId: number) {
    // TODO: use userId for activity logging later
    console.log(userId);
    return this.prisma.profile.delete({ where: { id } });
  }

  private filterPrivateFields(profile: Profile & { address?: Address[] }) {
    const filtered: Partial<Profile & { address?: Address[] }> = { ...profile };

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

    if (profile.address && profile.address.length > 0) {
      filtered.address = profile.address.filter((address) => address.isPublic);
    }

    return filtered;
  }
}
