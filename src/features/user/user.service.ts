import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { Organization, Permission, Prisma, Profile, Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserJwtPayload } from '../../core/auth/interfaces/jwt-payload.interface';
import { Tokens } from './interface/tokens.interface';
import { RegisterDto } from './dto/request/register.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { randomInt } from 'crypto';
import { EmailService } from 'src/shared/services/email.service';
import { ProfileService } from '../profile/profile.service';
import { RegisterResponseDto } from './dto/response/register-response.dto';

interface FindUniqieOrgUserParams {
  userFilters: FindUniqieOrgUserUserFilterParams,
  organizationFilters?: FindUniqueOrgUserOrganizationFilterParams
}

interface FindUniqieOrgUserUserFilterParams {
  id?: number,
  username?: string,
  email?: string,
  phone?: string
}

interface FindUniqueOrgUserOrganizationFilterParams {
  organizationId?: number,
  organizationCode?: string
}

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private profileService: ProfileService,
  ) { }

  async findUniqueOrgUser({ userFilters, organizationFilters }: FindUniqieOrgUserParams, include?: Prisma.UserInclude): Promise<User | null> {
    const { id, username, email, phone } = userFilters;

    if (id) {
      return await this.prisma.user.findUnique({ where: { id } })
    }

    if (!username && !email && !phone) return null;

    let { organizationId, organizationCode } = organizationFilters ?? {};
    if (!organizationId && organizationCode) {
      const organization = await this.prisma.organization.findUnique({ where: { code: organizationCode } });
      organizationId = organization?.id;
    }
    
    if (organizationId) {
      const where: Prisma.UserWhereUniqueInput = {
        username_organizationId: username ? { username, organizationId } : undefined,
        email_organizationId: email ? { email, organizationId } : undefined,
        phone_organizationId: phone ? { phone, organizationId } : undefined,
      };
      return await this.prisma.user.findUnique({ where, include });
    } else {
      const where: Prisma.UserWhereInput = {
        username,
        email,
        phone,
        organizationId: null,
        isSuperAdmin: true
      }
      return await this.prisma.user.findFirst({ where, include });
    }
  }

  async updateOrgUser(filters: FindUniqieOrgUserParams, data: Partial<User>, include?: Prisma.UserInclude) {
    const user = await this.findUniqueOrgUser(filters, include);
    if (!user) return null;

    return await this.prisma.user.update({
      where: { id: user.id },
      data,
    });
  }

  async validateUser(username: string, password: string, organizationCode?: string): Promise<User> {
    const userInclude: Prisma.UserInclude = { role: { include: { permissions: true } } };
    let user: User | null = await this.findUniqueOrgUser({ userFilters: { username }, organizationFilters: { organizationCode } }, userInclude);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line
    const isPasswordValid: boolean = await bcrypt.compare(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(
    user: User,
    deviceId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<LoginResponseDto> {
    const { accessToken, refreshToken } = await this.generateTokens(
      user,
      deviceId,
    );

    // Store refresh token in database
    await this.storeRefreshToken(
      user.id,
      refreshToken,
      deviceId,
      userAgent,
      ipAddress,
    );

    return new LoginResponseDto(accessToken, refreshToken, user, deviceId);
  }

  async register(
    registerDto: RegisterDto,
    userId: number,
    userOrganizationId?: number
  ): Promise<RegisterResponseDto> {
    const { username, email, password, organizationId } = registerDto;

    // Check if user already exists
    const userFilters = { username, email };
    const organizationFilters = { organizationId };
    const existingUser = await this.findUniqueOrgUser({ userFilters, organizationFilters })

    if (existingUser) {
      throw new ForbiddenException('Username already exists');
    }

    const profile = await this.profileService.create(
      registerDto.profile,
      userId,
    );

    // Hash password
    // eslint-disable-next-line
    const hashedPassword: string = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        phone: registerDto.phone,
        password: hashedPassword,
        isActive: true,
        organizationId: organizationId ?? userOrganizationId,
        roleId: registerDto.roleId,
        profileId: profile.id,
        createdById: userId,
        updatedById: userId,
      },
      include: { role: true, profile: true },
    });

    return new RegisterResponseDto(user);
  }

  async refreshTokens(
    userId: number,
    refreshToken: string,
    deviceId: string,
  ): Promise<Tokens> {
    // Find the session with this refresh token
    const session = await this.prisma.session.findFirst({
      where: {
        userId,
        refreshToken,
        deviceId,
      },
    });

    if (!session || new Date() > session.expiresAt) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user, deviceId);

    // Update refresh token in database
    await this.updateRefreshToken(session.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: number, refreshToken: string): Promise<boolean> {
    await this.prisma.session.deleteMany({
      where: {
        userId,
        refreshToken,
      },
    });

    return true;
  }

  async logoutAll(userId: number): Promise<boolean> {
    await this.prisma.session.deleteMany({
      where: {
        userId,
      },
    });

    return true;
  }

  async sendPasswordResetCode(email: string, organizationCode?: string): Promise<boolean> {
    const user = await this.findUniqueOrgUser({ userFilters: { email }, organizationFilters: { organizationCode } });
    if (!user) throw new NotFoundException('User not found');

    const code = randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const data = {
      resetCode: code,
      resetCodeExpiresAt: expires,
    };
    await this.updateOrgUser({ userFilters: { email }, organizationFilters: { organizationCode } }, data);

    await this.emailService.sendEmail(
      email,
      'Your password reset code',
      `Your password reset code is: ${code}`,
      `<p>Your password reset code is: <b>${code}</b></p>`,
    );

    return true;
  }

  async resetPasswordWithCode(
    email: string,
    code: string,
    newPassword: string,
    organizationId?: number
  ): Promise<boolean> {
    const user = await this.findUniqueOrgUser({ userFilters: { email }, organizationFilters: { organizationId } });
    if (
      !user ||
      user.resetCode !== code ||
      !user.resetCodeExpiresAt ||
      user.resetCodeExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('Invalid or expired code');
    }

    // eslint-disable-next-line
    const hashed = await bcrypt.hash(newPassword, 10) as string;

    const filter = {
      userFilters: { email },
      organizationFilters: { organizationId }
    }
    const data = {
      password: hashed,
      resetCode: null,
      resetCodeExpiresAt: null,
    }
    await this.updateOrgUser(filter, data);

    return true;
  }

  private async generateTokens(user: User & { profile?: Profile | null, role?: Role & { permissions?: Permission[] } | null, organization?: Organization | null }, deviceId: string): Promise<Tokens> {
    let { profile, role, organization, username, organizationId, isSuperAdmin } = user;

    if (!profile)
      profile = await this.prisma.profile.findUnique({ where: { id: user.profileId } });
    let name = 'Unknown User';
    if (profile) {
      name = profile?.nickName ?? (profile.name + ' ' + profile.lastName);
    }

    if (user.roleId && (!role || (role && !role.permissions))) {
      role = await this.prisma.role.findUnique({ where: { id: user.roleId }, include: { permissions: true } });
    }

    let permissions: string[] | null = null;
    if (role?.permissions) {
      permissions = role.permissions.map(permission => permission.resource + '__' + permission.action);
    }

    if (!organization)
      organization = await this.prisma.organization.findUnique({ where: { id: user.profileId } });

    const jwtPayload: UserJwtPayload = {
      sub: user.id,
      username,
      name,
      organizationId: organizationId ?? undefined,
      organizationName: organization?.name ?? undefined,
      isSuperAdmin,
      roleName: role?.name ?? null,
      permissions,
      type: 'user',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_EXPIRE_IN',
          '15m',
        ),
      }),
      this.jwtService.signAsync(
        { ...jwtPayload, deviceId },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>(
            'JWT_REFRESH_EXPIRE_IN',
            '7d',
          ),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async storeRefreshToken(
    userId: number,
    refreshToken: string,
    deviceId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<void> {
    // Calculate expiration date
    const expiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRE_IN',
      '7d',
    );
    const expiresAt = this.calculateExpirationDate(expiresIn);

    // Store in database
    await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        deviceId,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });
  }

  private async updateRefreshToken(
    sessionId: number,
    newRefreshToken: string,
  ): Promise<void> {
    const expiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRE_IN',
      '7d',
    );
    const expiresAt = this.calculateExpirationDate(expiresIn);

    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        refreshToken: newRefreshToken,
        expiresAt,
      },
    });
  }

  private calculateExpirationDate(expiresIn: string): Date {
    const now = new Date();
    const match = expiresIn.match(/^(\d+)([smhd])$/);

    if (!match) {
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default: 7 days
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return new Date(now.getTime() + value * 1000);
      case 'm':
        return new Date(now.getTime() + value * 60 * 1000);
      case 'h':
        return new Date(now.getTime() + value * 60 * 60 * 1000);
      case 'd':
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  }
}
