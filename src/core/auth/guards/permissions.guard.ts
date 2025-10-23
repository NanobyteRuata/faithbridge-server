import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { UserJwtPayload } from '../interfaces/jwt-payload.interface';
import { AccessCodePayload } from '../interfaces/access-code-payload.interface';

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
    const request = context.switchToHttp().getRequest() as { user: UserJwtPayload | AccessCodePayload };
    const userOrAccess = request.user;

    if (!userOrAccess) {
      throw new ForbiddenException('No user found in request');
    }

    let permissions: string[] = [];
    if (userOrAccess.type === 'accessCode') {
      permissions = userOrAccess.permissions;
    }

    if (userOrAccess.type === 'user') {
      // Get user's permissions from DB (or from JWT if you store them there)
      const dbUser = await this.prisma.user.findUnique({
        where: { id: userOrAccess.sub },
        include: {
          role: { include: { permissions: true } },
        },
      });

      if (dbUser?.isSuperAdmin) {
        return true;
      }

      if (!dbUser?.role) {
        throw new ForbiddenException();
      }

      permissions = dbUser.role.permissions.map(
        (p) => p.resource + '__' + p.action,
      );
    }

    const hasPermission = requiredPermissions.every((perm) =>
      permissions.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
