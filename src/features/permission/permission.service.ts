import { Injectable } from '@nestjs/common';
import { BulkCreatePermissionsDto } from './dto/request/bulk-create-permissions.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GetPermissionsDto } from './dto/query/get-permissions.dto';
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

  async findAll(
    { skip, limit, search }: GetPermissionsDto,
    organizationId?: number,
  ) {
    const args: Prisma.PermissionFindManyArgs = {
      skip,
      take: limit,
      where: {
        resource: {
          contains: search?.trim(),
          mode: 'insensitive',
        },
        action: {
          contains: search?.trim(),
          mode: 'insensitive',
        },
        organization: {
          name: {
            contains: search?.trim(),
            mode: 'insensitive',
          },
          id: organizationId,
        },
      },
    };

    const [permissions, total] = await this.prisma.$transaction([
      this.prisma.permission.findMany(args),
      this.prisma.permission.count({ where: args.where }),
    ]);

    return {
      data: permissions,
      meta: {
        page: skip,
        limit,
        total,
      },
      success: true,
    };
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

    const makeKey = (p: { resource: string; action: string }) =>
      JSON.stringify([p.resource, p.action]);

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
              resource: p.resource,
              action: p.action,
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
