import { Injectable } from '@nestjs/common';
import { CreateStatusDto } from './dto/request/create-status.dto';
import { UpdateStatusDto } from './dto/request/update-status.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GetStatusesDto } from './dto/query/get-statuses.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StatusService {
  constructor(private readonly prisma: PrismaService) {}

  create(createStatusDto: CreateStatusDto, userId: number) {
    return this.prisma.status.create({
      data: {
        ...createStatusDto,
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

  findOne(id: number) {
    return this.prisma.status.findUnique({ where: { id } });
  }

  update(id: number, updateStatusDto: UpdateStatusDto, userId: number) {
    return this.prisma.status.update({
      where: { id },
      data: {
        ...updateStatusDto,
        updatedById: userId,
      },
    });
  }

  remove(id: number, userId: number) {
    // TODO: use userId for activity logging later
    console.log(userId);
    return this.prisma.status.delete({ where: { id } });
  }
}
