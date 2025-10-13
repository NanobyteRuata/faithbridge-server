import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as CustomStrategy } from 'passport-custom';
import { Request } from 'express';
import { AccessCodeJwtPayload } from '../interfaces/jwt-payload.interface';
import { AccessCodeService } from 'src/features/access-code/access-code.service';

@Injectable()
export class AccessCodeStrategy extends PassportStrategy(
  CustomStrategy,
  'access-code',
) {
  constructor(private accessCodeService: AccessCodeService) {
    super();
  }

  async validate(req: Request): Promise<AccessCodeJwtPayload> {
    const accessCode = (req.headers['x-access-code']) as string;
    const organizationId = Number(req.headers['x-org-id']);

    if (!accessCode) throw new BadRequestException('Access code required');
    if (!organizationId) throw new BadRequestException('Organization ID required');

    const payload = await this.accessCodeService.validate(accessCode, organizationId);

    if (!payload) {
      throw new UnauthorizedException('Invalid access code');
    }

    return payload;
  }
}
