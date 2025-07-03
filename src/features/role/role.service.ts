import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/request/create-role.dto';
import { UpdateRoleDto } from './dto/request/update-role.dto';
import { Permission, Prisma, Role } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GetRolesDto } from './dto/query/get-roles.dto';
import { PaginatedDto } from 'src/shared/dto/response/paginated.dto';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPermissions(): Promise<Permission[]> {
    return await this.prisma.permission.findMany();
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, permissions } = createRoleDto;
    const role = await this.prisma.role.create({
      data: {
        name,
        permissions: {
          connect: permissions.map((id) => ({ id })),
        },
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
    };
    const roles = await this.prisma.role.findMany(args);
    const total = await this.prisma.role.count({ where: args.where });

    return {
      data: roles,
      meta: {
        page,
        limit,
        total,
      },
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
  ): Promise<Role> {
    const role = await this.prisma.role.update({
      where: { id },
      data: {
        name,
        permissions: { connect: permissions?.map((id) => ({ id })) ?? [] },
      },
      include: { permissions: true },
    });
    return role;
  }

  async removeRole(id: number): Promise<Role> {
    return await this.prisma.role.delete({ where: { id } });
  }
}
