import { Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GetOrganizationsDto } from './dto/query/get-organizations.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  create(createOrganizationDto: CreateOrganizationDto, createdById: number) {
    return this.prisma.organization.create({ data: {
      ...createOrganizationDto,
      createdById
    } });
  }

  async findAll({ skip, limit, search }: GetOrganizationsDto) {
    const args: Prisma.OrganizationFindManyArgs = {
      skip,
      take: limit,
      where: {
        name: {
          contains: search?.trim(),
          mode: 'insensitive',
        },
      },
    };

    const [memberships, total] = await this.prisma.$transaction([
      this.prisma.organization.findMany(args),
      this.prisma.organization.count({ where: args.where }),
    ]);

    return {
      data: memberships,
      meta: {
        page: skip,
        limit,
        total,
      },
      success: true,
    };
  }

  findOne(id: number) {
    return this.prisma.organization.findUnique({ where: { id } });
  }

  update(id: number, updateOrganizationDto: UpdateOrganizationDto, updatedById: number) {
    return this.prisma.organization.update({ where: { id }, data: { ...updateOrganizationDto, updatedById } });
  }

  remove(id: number, userId: number) {
    console.log(userId);
    return this.prisma.organization.delete({ where: { id } });
  }
}
