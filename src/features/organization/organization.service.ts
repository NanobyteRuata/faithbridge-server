import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/request/create-organization.dto';
import { UpdateOrganizationDto } from './dto/request/update-organization.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GetOrganizationsDto } from './dto/query/get-organizations.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  create(createOrganizationDto: CreateOrganizationDto, createdById: number) {
    return this.prisma.organization.create({
      data: {
        ...createOrganizationDto,
        createdById,
      },
    });
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

    const [organizations, total] = await this.prisma.$transaction([
      this.prisma.organization.findMany(args),
      this.prisma.organization.count({ where: args.where }),
    ]);

    return {
      data: organizations,
      meta: {
        page: skip,
        limit,
        total,
      },
      success: true,
    };
  }

  findSelfOrganization(organizationId?: number) {
    if (!organizationId) throw new BadRequestException('Organization ID is required');
    return this.prisma.organization.findUnique({ where: { id: organizationId } });
  }

  findOne(id: number) {
    return this.prisma.organization.findUnique({ where: { id } });
  }

  update(
    id: number,
    updateOrganizationDto: UpdateOrganizationDto,
    updatedById: number,
  ) {
    return this.prisma.organization.update({
      where: { id },
      data: { ...updateOrganizationDto, updatedById },
    });
  }

  remove(id: number, userId: number) {
    console.log(userId);
    return this.prisma.organization.delete({ where: { id } });
  }
}
