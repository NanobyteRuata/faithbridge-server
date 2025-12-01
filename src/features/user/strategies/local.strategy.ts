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
    super({ passReqToCallback: true, usernameField: 'email' });
  }

  async validate(
    req: Request,
    email: string,
    password: string,
  ): Promise<User> {
    // eslint-disable-next-line
    const organizationCode: string | undefined = req.body?.organizationCode;

    const user = await this.userService.validateUser(
      email,
      password,
      organizationCode,
    );
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
