import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateStatusDto } from './dto/request/create-status.dto';
import { UpdateStatusDto } from './dto/request/update-status.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GetStatusesDto } from './dto/query/get-statuses.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StatusService {
  constructor(private readonly prisma: PrismaService) {}

  create(
    createStatusDto: CreateStatusDto,
    userId: number,
    organizationId: number,
  ) {
    return this.prisma.status.create({
      data: {
        ...createStatusDto,
        organizationId,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll({ skip, limit, search }: GetStatusesDto) {
    const args: Prisma.StatusFindManyArgs = {
      skip,
      take: limit,
      where: {
        name: {
          contains: search?.trim(),
          mode: 'insensitive',
        },
      },
    };

    const [statuses, total] = await this.prisma.$transaction([
      this.prisma.status.findMany(args),
      this.prisma.status.count({ where: args.where }),
    ]);

    return {
      data: statuses,
      meta: {
        page: skip,
        limit,
        total,
      },
      success: true,
    };
  }

  async findAllDropdown(organizationId: number) {
    return await this.prisma.status.findMany({
      where: { organizationId },
      select: { id: true, name: true },
    });
  }

  async findOne(id: number, userOrgId?: number) {
    const status = await this.prisma.status.findUnique({ where: { id } });
    const isNotSameOrg = userOrgId && status?.organizationId !== userOrgId;
    if (!status || isNotSameOrg) {
      throw new BadRequestException('Status not found');
    }
    return status;
  }

  async update(id: number, updateStatusDto: UpdateStatusDto, userId: number, userOrgId?: number) {
    await this.findOne(id, userOrgId); // this will throw BadRequestException if status not found
    return this.prisma.status.update({
      where: { id },
      data: {
        ...updateStatusDto,
        updatedById: userId,
      },
    });
  }

  async remove(id: number, userId: number, userOrgId?: number) {
    await this.findOne(id, userOrgId); // this will throw BadRequestException if status not found
    
    // TODO: use userId for activity logging later
    console.log(userId);
    return this.prisma.status.delete({ where: { id } });
  }
}
