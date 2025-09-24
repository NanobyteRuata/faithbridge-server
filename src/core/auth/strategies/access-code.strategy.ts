import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as CustomStrategy } from 'passport-custom';
import { Request } from 'express';
import { PrismaService } from 'src/core/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AccessCodeUserPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AccessCodeStrategy extends PassportStrategy(
  CustomStrategy,
  'access-code',
) {
  constructor(private prisma: PrismaService) {
    super();
  }

  async validate(req: Request): Promise<AccessCodeUserPayload> {
    const accessCode = (req.headers['x-access-code'] ||
      req.query.accessCode) as string;
    if (!accessCode) throw new UnauthorizedException('Access code required');
    const accessCodeEntities = await this.prisma.accessCode.findMany({
      include: { role: { include: { permissions: true } } },
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
          permissions: role.permissions.map(
            (p) => p.resource + '__' + p.action,
          ),
          type: 'accessCode',
        };
      }
    }
    throw new UnauthorizedException('Invalid access code');
  }
}
