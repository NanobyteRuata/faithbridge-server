import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccessCodeDto } from './dto/request/create-access-code.dto';
import { UpdateAccessCodeDto } from './dto/request/update-access-code.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { GetAccessCodesDto } from './dto/query/get-access-codes.dto';
import { Prisma } from '@prisma/client';
import { AccessCodeJwtPayload } from 'src/core/auth/interfaces/jwt-payload.interface';

@Injectable()
export class AccessCodeService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(
    accessCode: string,
    organizationId: number,
  ): Promise<AccessCodeJwtPayload | null> {
    const accessCodeEntities = await this.prisma.accessCode.findMany({
      where: { organizationId },
      include: { role: { include: { permissions: true } }, organization: true },
    });
    for (const entity of accessCodeEntities) {
      const { id, expireDate, hashedCode, role, isActive } = entity;

      const isExpired =
        (expireDate && Date.now() > expireDate.getTime()) ?? false;
      if (isExpired || !isActive) continue;

      // eslint-disable-next-line
      const isValid = await bcrypt.compare(accessCode, hashedCode);
      if (isValid) {
        return {
          id,
          name: entity.name,
          organizationId: entity.organizationId,
          organizationName: entity.organization.name,
          permissions: role.permissions.map(
            (p) => p.resource + '__' + p.action,
          ),
          type: 'accessCode',
        };
      }
    }
    return null;
  }

  async login(accessCode: string, organizationCode: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { code: organizationCode },
    });
    if (!organization) {
      throw new NotFoundException();
    }

    return await this.validate(accessCode, organization.id);
  }

  async create(createAccessCodeDto: CreateAccessCodeDto, userId: number) {
    const { code, ...rest } = createAccessCodeDto;

    // eslint-disable-next-line
    const hashedCode = (await bcrypt.hash(code, 10)) as string;

    return this.prisma.accessCode.create({
      data: {
        ...rest,
        hashedCode,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll({ skip, limit, search, organizationId }: GetAccessCodesDto) {
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
    const { code, ...restDto } = updateAccessCodeDto;

    const updatedData = {
      ...restDto,
      updatedById: userId,
    };

    if (code) {
      // eslint-disable-next-line
      const newHashedCode = (await bcrypt.hash(code, 10)) as string;
      updatedData['hashedCode'] = newHashedCode;
    }

    const accessCodeEntity = await this.prisma.accessCode.update({
      where: { id, organizationId },
      data: updatedData,
    });

    // eslint-disable-next-line
    const { hashedCode, ...restEntity } = accessCodeEntity;

    return restEntity;
  }

  async remove(id: number, userId: number, organizationId?: number) {
    // TODO: use userId for activity logging later
    console.log(userId);
    return this.prisma.accessCode.delete({ where: { id, organizationId } });
  }
}
