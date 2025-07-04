import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/request/create-profile.dto';
import { UpdateProfileDto } from './dto/request/update-profile.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GetProfilesDto } from './dto/query/get-profiles.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  create(createProfileDto: CreateProfileDto, userId: number) {
    return this.prisma.profile.create({
      data: {
        ...createProfileDto,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll({ skip, limit, search }: GetProfilesDto) {
    const args: Prisma.ProfileFindManyArgs = {
      skip,
      take: limit,
      where: {
        name: {
          contains: search?.trim(),
          mode: 'insensitive',
        },
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

  findOne(id: number) {
    return this.prisma.profile.findUnique({ where: { id } });
  }

  update(id: number, updateProfileDto: UpdateProfileDto, userId: number) {
    return this.prisma.profile.update({
      where: { id },
      data: {
        ...updateProfileDto,
        updatedById: userId,
      },
    });
  }

  remove(id: number, userId: number) {
    // TODO: use userId for activity logging later
    console.log(userId);
    return this.prisma.profile.delete({ where: { id } });
  }
}
