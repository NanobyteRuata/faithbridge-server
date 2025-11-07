import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccessCodeDto } from './dto/request/create-access-code.dto';
import { UpdateAccessCodeDto } from './dto/request/update-access-code.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { GetAccessCodesDto } from './dto/query/get-access-codes.dto';
import { Prisma } from '@prisma/client';
import { AccessCodePayload } from 'src/core/auth/interfaces/access-code-payload.interface';

@Injectable()
export class AccessCodeService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(
    accessCode: string,
    organizationCode: string,
  ): Promise<AccessCodePayload> {
    const accessCodeEntities = await this.prisma.accessCode.findMany({
      where: { organization: { code: organizationCode } },
      include: { role: { include: { permissions: true } }, organization: true },
    });
    for (const entity of accessCodeEntities) {
      const { id, expireDate, code, role, isActive, organizationId } = entity;

      const isExpired =
        (expireDate && Date.now() > expireDate.getTime()) ?? false;
      if (isExpired || !isActive) continue;

      if (accessCode === code) {
        return {
          id,
          name: entity.name,
          organizationId,
          permissions: role.permissions.map(
            (p) => p.permission,
          ),
          type: 'accessCode',
        };
      }
    }
    throw new NotFoundException('Access code not found');
  }

  async login(
    accessCode: string,
    organizationCode: string,
  ): Promise<AccessCodePayload> {
    return await this.validate(accessCode, organizationCode);
  }

  async create(createAccessCodeDto: CreateAccessCodeDto, userId: number, organizationId: number) {
    return this.prisma.accessCode.create({
      data: {
        ...createAccessCodeDto,
        organizationId,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll({ skip, limit, search }: GetAccessCodesDto, organizationId?: number) {
    const args: Prisma.AccessCodeFindManyArgs = {
      skip,
      take: limit,
      where: {
        name: {
          contains: search?.trim(),
          mode: 'insensitive',
        },
        organizationId,
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

  findOne(id: number, organizationId?: number) {
    return this.prisma.accessCode.findUnique({ where: { id, organizationId } });
  }

  async update(
    id: number,
    updateAccessCodeDto: UpdateAccessCodeDto,
    userId: number,
    organizationId?: number,
  ) {
    const updatedData = {
      ...updateAccessCodeDto,
      updatedById: userId,
    };

    const accessCodeEntity = await this.prisma.accessCode.update({
      where: { id, organizationId },
      data: updatedData,
    });

    return accessCodeEntity;
  }

  async remove(id: number, userId: number, organizationId?: number) {
    // TODO: use userId for activity logging later
    console.log(userId);
    return this.prisma.accessCode.delete({ where: { id, organizationId } });
  }
}
