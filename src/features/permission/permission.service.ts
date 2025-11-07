import { Injectable } from '@nestjs/common';
import {
  BulkCreatePermissionsDto,
  EachPermissionDto,
} from './dto/request/bulk-create-permissions.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  bulkCreate(
    { permissions, organizationId }: BulkCreatePermissionsDto,
    createdById: number,
  ) {
    const data = permissions.map((permission) => ({
      ...permission,
      organizationId,
      createdById,
    }));
    return this.prisma.permission.createManyAndReturn({ data });
  }

  findViewPermissions(organizationId?: number) {
    return this.prisma.permission.findMany({
      where: { permission: { endsWith: '__VIEW' }, organizationId },
    });
  }

  findAll(organizationId?: number) {
    return this.prisma.permission.findMany({ where: { organizationId } });
  }

  findOne(id: number, organizationId?: number) {
    return this.prisma.permission.findUnique({ where: { id, organizationId } });
  }

  async bulkUpdate(
    { permissions, organizationId }: BulkCreatePermissionsDto,
    updatedById: number,
  ) {
    const existingPermissions = await this.prisma.permission.findMany({
      where: { organizationId },
    });

    const makeKey = (p: EachPermissionDto) => p.permission;

    const inputSet = new Set(permissions.map(makeKey));
    const existingSet = new Set(existingPermissions.map(makeKey));

    const toCreate = permissions
      .filter((p) => !existingSet.has(makeKey(p)))
      .map((p) => ({ ...p, organizationId, createdById: updatedById }));
    const toDelete = existingPermissions.filter(
      (p) => !inputSet.has(makeKey(p)),
    );

    const actions: Prisma.PrismaPromise<Prisma.BatchPayload>[] = [];

    if (toCreate.length) {
      actions.push(
        this.prisma.permission.createMany({
          data: toCreate,
          skipDuplicates: true,
        }),
      );
    }

    if (toDelete.length) {
      actions.push(
        this.prisma.permission.deleteMany({
          where: {
            OR: toDelete.map((p) => ({
              permission: p.permission,
              organizationId,
            })),
          },
        }),
      );
    }

    if (actions.length) {
      await this.prisma.$transaction(actions);
    }

    return this.prisma.permission.findMany({ where: { organizationId } });
  }

  remove(id: number, userId: number) {
    console.log('removed by:', userId);
    return this.prisma.permission.delete({ where: { id } });
  }
}
