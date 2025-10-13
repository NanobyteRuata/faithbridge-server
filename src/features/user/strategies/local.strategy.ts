import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user.service';
import { User } from '@prisma/client';
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({ passReqToCallback: true });
  }

  async validate(
    req: Request,
    username: string,
    password: string,
  ): Promise<User> {
    // eslint-disable-next-line
    const organizationCode: string | undefined = req.body?.organizationCode;

    const user = await this.userService.validateUser(
      username,
      password,
      organizationCode,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
