import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/request/create-role.dto';
import { UpdateRoleDto } from './dto/request/update-role.dto';
import { Permission, Prisma, Role } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GetRolesDto } from './dto/query/get-roles.dto';
import { PaginatedDto } from 'src/shared/dto/response/paginated.dto';
import { UserJwtPayload } from 'src/core/auth/interfaces/jwt-payload.interface';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPermissions(): Promise<Permission[]> {
    return await this.prisma.permission.findMany();
  }

  async createRole(
    createRoleDto: CreateRoleDto,
    userId: number,
  ): Promise<Role> {
    const { name, permissions } = createRoleDto;
    const role = await this.prisma.role.create({
      data: {
        name,
        permissions: {
          connect: permissions.map((id) => ({ id })),
        },
        createdById: userId,
        updatedById: userId,
      },
      include: {
        permissions: true,
      },
    });

    return role;
  }

  async findAllRoles({
    page,
    limit,
    skip,
    search,
  }: GetRolesDto): Promise<PaginatedDto<Role>> {
    const args: Prisma.RoleFindManyArgs = {
      skip,
      take: limit,
      where: {
        name: {
          contains: search?.trim(),
          mode: 'insensitive',
        },
      },
      include: {
        permissions: true,
      },
    };

    const [roles, total] = await this.prisma.$transaction([
      this.prisma.role.findMany(args),
      this.prisma.role.count({ where: args.where }),
    ]);

    return {
      data: roles,
      meta: {
        page,
        limit,
        total,
      },
      success: true,
    };
  }

  async findOneRole(id: number): Promise<Role> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return role;
  }

  async updateRole(
    id: number,
    { name, permissions }: UpdateRoleDto,
    userId: number,
  ): Promise<Role> {
    const data: Prisma.RoleUpdateInput = {
      name,
      updatedBy: {
        connect: { id: userId },
      },
    };

    if (permissions) {
      data.permissions = {
        set: permissions.map((id) => ({ id })),
      };
    }

    return await this.prisma.role.update({
      where: { id },
      data,
      include: { permissions: true },
    });
  }

  async removeRole(id: number, user: UserJwtPayload): Promise<Role> {
    const role = await this.findOneRole(id);
    if (!user.isSuperAdmin && role.isOwner) {
      throw new BadRequestException('Owner role cannot be deleted');
    }

    // TODO: use userId for activity logging later
    console.log('role removed by: user id:', user.sub);
    return await this.prisma.role.delete({ where: { id } });
  }
}
