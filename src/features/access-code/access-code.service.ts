import { Injectable } from '@nestjs/common';
import { CreateAccessCodeDto } from './dto/request/create-access-code.dto';
import { UpdateAccessCodeDto } from './dto/request/update-access-code.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { GetAccessCodesDto } from './dto/query/get-access-codes.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccessCodeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAccessCodeDto: CreateAccessCodeDto, userId: number) {
    const { code, ...rest } = createAccessCodeDto;

    // eslint-disable-next-line
    const hashedCode = (await bcrypt.hash(code, 10)) as string;

    return this.prisma.accessCode.create({
      data: {
        ...rest,
        permissions: {
          connect: createAccessCodeDto.permissions.map((permissionId) => ({
            id: permissionId,
          })),
        },
        hashedCode,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll({ skip, limit, search }: GetAccessCodesDto) {
    const args: Prisma.AccessCodeFindManyArgs = {
      skip,
      take: limit,
      where: {
        name: {
          contains: search?.trim(),
          mode: 'insensitive',
        },
      },
    };

    const [accessCodes, total] = await this.prisma.$transaction([
      this.prisma.accessCode.findMany(args),
      this.prisma.accessCode.count({ where: args.where }),
    ]);

    return {
      data: accessCodes,
      meta: {
        page: skip,
        limit,
        total,
      },
      success: true,
    };
  }

  findOne(id: number) {
    return this.prisma.accessCode.findUnique({ where: { id } });
  }

  async update(
    id: number,
    updateAccessCodeDto: UpdateAccessCodeDto,
    userId: number,
  ) {
    const { code, ...restDto } = updateAccessCodeDto;

    // eslint-disable-next-line
    const newHashedCode = (await bcrypt.hash(code, 10)) as string;

    const accessCodeEntity = await this.prisma.accessCode.update({
      where: { id },
      data: {
        ...restDto,
        permissions: {
          set: updateAccessCodeDto.permissions?.map((permissionId) => ({
            id: permissionId,
          })),
        },
        hashedCode: newHashedCode,
        updatedById: userId,
      },
    });

    const { hashedCode, ...restEntity } = accessCodeEntity;

    return restEntity;
  }

  async remove(id: number, userId: number) {
    // TODO: use userId for activity logging later
    console.log(userId);
    return this.prisma.accessCode.delete({ where: { id } });
  }
}
