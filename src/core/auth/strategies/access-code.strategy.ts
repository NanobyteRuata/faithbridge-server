import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as CustomStrategy } from 'passport-custom';
import { Request } from 'express';
import { AccessCodePayload } from '../interfaces/access-code-payload.interface';
import { AccessCodeService } from 'src/features/access-code/access-code.service';

@Injectable()
export class AccessCodeStrategy extends PassportStrategy(
  CustomStrategy,
  'access-code',
) {
  constructor(private accessCodeService: AccessCodeService) {
    super();
  }

  async validate(req: Request): Promise<AccessCodePayload> {
    const accessCode = req.headers['x-access-code'] as string;
    const organizationCode = req.headers['x-org-code'] as string;

    if (!accessCode) throw new BadRequestException('Access code required');
    if (!organizationCode)
      throw new BadRequestException('Organization code required');

    const payload = await this.accessCodeService.validate(
      accessCode,
      organizationCode,
    );

    return payload;
  }
}
