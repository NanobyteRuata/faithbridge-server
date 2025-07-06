import { Injectable } from '@nestjs/common';
import { CreateAccessCodeDto } from './dto/request/create-access-code.dto';
import { UpdateAccessCodeDto } from './dto/request/update-access-code.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

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

  findAll() {
    return this.prisma.accessCode.findMany();
  }

  findOne(id: number) {
    return this.prisma.accessCode.findUnique({ where: { id } });
  }

  async update(
    id: number,
    updateAccessCodeDto: UpdateAccessCodeDto,
    userId: number,
  ) {
    const { code } = updateAccessCodeDto;

    // eslint-disable-next-line
    const hashedCode = (await bcrypt.hash(code, 10)) as string;

    return this.prisma.accessCode.update({
      where: { id },
      data: {
        ...updateAccessCodeDto,
        permissions: {
          set: updateAccessCodeDto.permissions?.map((permissionId) => ({
            id: permissionId,
          })),
        },
        hashedCode,
        updatedById: userId,
      },
    });
  }

  async remove(id: number, userId: number) {
    // TODO: use userId for activity logging later
    console.log(userId);
    return this.prisma.accessCode.delete({ where: { id } });
  }
}
