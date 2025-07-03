import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required
    }

    // eslint-disable-next-line
    const request = context.switchToHttp().getRequest() as { user: JwtPayload };
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No user found in request');
    }

    // Get user's permissions from DB (or from JWT if you store them there)
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      include: {
        role: { include: { permissions: true } },
      },
    });

    if (!dbUser || !dbUser.role) {
      throw new ForbiddenException('User has no role');
    }

    const userPermissions = dbUser.role.permissions.map(
      (p) => p.action + ':' + p.resource,
    );

    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
