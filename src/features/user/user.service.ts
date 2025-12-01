import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { Permission, Prisma, Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserJwtPayload } from '../../core/auth/interfaces/jwt-payload.interface';
import { Tokens } from './interface/tokens.interface';
import { RegisterDto } from './dto/request/register.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { randomInt } from 'crypto';
import { EmailService } from 'src/shared/services/email.service';
import { RegisterResponseDto } from './dto/response/register-response.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { GetUsersDto } from './dto/query/get-users.dto';

interface FindUniqieOrgUserParams {
  userFilters: FindUniqieOrgUserUserFilterParams;
  organizationFilters?: FindUniqueOrgUserOrganizationFilterParams;
}

interface FindUniqieOrgUserUserFilterParams {
  id?: number;
  email?: string;
}

interface FindUniqueOrgUserOrganizationFilterParams {
  organizationId?: number;
  organizationCode?: string;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async findUniqueOrgUser(
    { userFilters, organizationFilters }: FindUniqieOrgUserParams,
    include?: Prisma.UserInclude,
  ): Promise<User | null> {
    const { id, email } = userFilters;

    if (!id && !email) return null;

    if (id) {
      return await this.prisma.user.findUnique({
        where: { id, organizationId: organizationFilters?.organizationId },
      });
    }

    let organizationId = organizationFilters?.organizationId;
    const organizationCode = organizationFilters?.organizationCode;

    if (!organizationId && organizationCode) {
      const organization = await this.prisma.organization.findUnique({
        where: { code: organizationCode },
      });
      organizationId = organization?.id;
    }

    if (organizationId) {
      const where: Prisma.UserWhereUniqueInput = {
        ...(id && { id, organizationId }),
        email_organizationId: email ? { email, organizationId } : undefined
      };
      return await this.prisma.user.findUnique({ where, include });
    } else {
      const where: Prisma.UserWhereInput = {
        email,
        organizationId: null,
        isSuperAdmin: true,
      };
      return await this.prisma.user.findFirst({ where, include });
    }
  }

  async updateOrgUser(
    filters: FindUniqieOrgUserParams,
    data: Partial<User> & { hashedPassword?: string },
    include?: Prisma.UserInclude,
  ) {
    const user = await this.findUniqueOrgUser(filters);
    if (!user || !user.isActive) throw new NotFoundException('User not found');

    if (data.password) {
      // eslint-disable-next-line
      data.password = await bcrypt.hash(data.password, 10);
    }

    if (data.hashedPassword) {
      data.password = data.hashedPassword;
      delete data.hashedPassword;
    }

    const res = await this.prisma.user.update({
      where: { id: user.id },
      data,
      include,
    });

    return this.filterSensitiveData(res);
  }

  async validateUser(
    email: string,
    password: string,
    organizationCode?: string,
  ): Promise<User> {
    const userInclude: Prisma.UserInclude = {
      role: { include: { permissions: true } },
    };
    const user: User | null = await this.findUniqueOrgUser(
      { userFilters: { email }, organizationFilters: { organizationCode } },
      userInclude,
    );

    if (!user || !user.isActive) {
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

  async findAll(
    { page, skip, limit, search, isActive }: GetUsersDto,
    organizationId?: number,
  ) {
    const args: Prisma.UserFindManyArgs = {
      skip,
      take: limit,
      where: {
        isActive,
        organizationId,
        ...(search && {
          OR: [
            { email: { contains: search } },
          ],
        }),
      },
      include: {
        role: true,
        profile: true,
      },
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany(args),
      this.prisma.user.count({ where: args.where }),
    ]);

    const filteredUsers = users.map((user) => this.filterSensitiveData(user));

    return {
      data: filteredUsers,
      meta: {
        page,
        limit,
        total,
      },
      success: true,
    };
  }

  async login(
    user: User,
    deviceId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<LoginResponseDto> {
    const { accessToken, refreshToken, jwtPayload } = await this.generateTokens(
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

    return new LoginResponseDto(
      accessToken,
      refreshToken,
      deviceId,
      user.email,
      jwtPayload?.permissions,
    );
  }

  async register(
    registerDto: RegisterDto,
    userId: number,
    userOrganizationId?: number,
  ): Promise<RegisterResponseDto> {
    const { email, password, organizationId, profileId } = registerDto;

    // Check if user already exists
    const userFilters = { email };
    const organizationFilters = { organizationId };
    const existingUser = await this.findUniqueOrgUser({
      userFilters,
      organizationFilters,
    });

    if (existingUser) {
      throw new ForbiddenException('User already exists');
    }

    // Hash password
    // eslint-disable-next-line
    const hashedPassword: string = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isActive: true,
        organizationId: organizationId ?? userOrganizationId,
        roleId: registerDto.roleId,
        profileId: profileId,
        createdById: userId,
        updatedById: userId,
      },
      include: { role: true, profile: true },
    });

    return new RegisterResponseDto(user);
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
    organizationId?: number,
  ) {
    return this.updateOrgUser(
      { userFilters: { id: userId }, organizationFilters: { organizationId } },
      updateUserDto,
    );
  }

  async deleteUser(userId: number, organizationId?: number) {
    return this.prisma.user.delete({
      where: { id: userId, organizationId },
    });
  }

  async refreshTokens(
    userId: number,
    refreshToken: string,
    deviceId: string,
  ): Promise<Tokens> {
    const user = await this.findUniqueOrgUser({ userFilters: { id: userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Find the session with this refresh token
    const session = await this.prisma.session.findFirst({
      where: {
        userId,
        refreshToken,
        deviceId,
      },
    });

    // Token reuse detection: If token not found, it may have been used already
    // This could indicate a token theft - invalidate all sessions for this device
    if (!session) {
      this.logger.warn(
        `Potential token reuse detected for user ${userId} on device ${deviceId}`,
      );
      // Invalidate all sessions for this device as a security measure
      await this.prisma.session.deleteMany({
        where: { userId, deviceId },
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token is expired
    if (new Date() > session.expiresAt) {
      await this.prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedException('Refresh token expired');
    }

    // Generate new tokens
    // eslint-disable-next-line
    const { jwtPayload, ...tokens } = await this.generateTokens(user, deviceId);

    // Implement token rotation: Update the refresh token in database
    // The old refresh token is now invalid
    await this.updateRefreshToken(session.id, tokens.refreshToken);

    return new LoginResponseDto(
      tokens.accessToken,
      tokens.refreshToken,
      deviceId,
      user.email,
      jwtPayload?.permissions,
    );
  }

  async logout(userId: number, refreshToken: string, deviceId?: string): Promise<boolean> {
    await this.prisma.session.deleteMany({
      where: {
        userId,
        refreshToken,
        deviceId,
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

  async sendPasswordResetCode(
    email: string,
    organizationCode?: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.findUniqueOrgUser({
      userFilters: { email },
      organizationFilters: { organizationCode },
    });
    if (!user || !user.isActive) throw new NotFoundException('User not found');

    const code = randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const data = {
      passwordResetCode: code,
      passwordResetCodeExpiresAt: expires,
    };
    await this.updateOrgUser(
      { userFilters: { email }, organizationFilters: { organizationCode } },
      data,
    );

    console.log(code);

    await this.emailService.sendEmail(
      email,
      'Your password reset code',
      `Your password reset code is: ${code}`,
      `<p>Your password reset code is: <b>${code}</b></p>`,
    );

    return {
      success: true,
      message: 'Password reset code sent successfully',
    };
  }

  async resetPasswordWithCode(
    email: string,
    code: string,
    newPassword: string,
    organizationCode?: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.findUniqueOrgUser({
      userFilters: { email },
      organizationFilters: { organizationCode },
    });
    if (
      !user ||
      !user.isActive ||
      user.passwordResetCode !== code ||
      !user.passwordResetCodeExpiresAt ||
      user.passwordResetCodeExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('Invalid or expired code');
    }

    // Hash the new password before storing
    // eslint-disable-next-line
    const hashedPassword: string = await bcrypt.hash(newPassword, 10);

    const filter = {
      userFilters: { email },
      organizationFilters: { organizationCode },
    };
    const data = {
      hashedPassword,
      passwordResetCode: null,
      passwordResetCodeExpiresAt: null,
    };
    await this.updateOrgUser(filter, data);

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  private async generateTokens(
    user: User & {
      role?: (Role & { permissions?: Permission[] }) | null;
    },
    deviceId: string,
  ): Promise<Tokens> {
    let { role } = user;

    if (user.roleId && (!role || (role && !role.permissions))) {
      role = await this.prisma.role.findUnique({
        where: { id: user.roleId },
        include: { permissions: true },
      });
    }

    let permissions: string[] = [];
    if (role?.permissions) {
      permissions = role.permissions.map((permission) => permission.permission);
    }

    // Generate unique identifiers for each token to prevent collisions
    const accessTokenId = uuidv4();
    const refreshTokenId = uuidv4();
    const timestamp = Date.now();

    const jwtPayload: UserJwtPayload = {
      sub: user.id,
      organizationId: user.organizationId ?? undefined,
      isSuperAdmin: user.isSuperAdmin,
      permissions,
      type: 'user',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          ...jwtPayload,
          jti: accessTokenId,
          iat: Math.floor(timestamp / 1000),
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get<string>(
            'JWT_ACCESS_EXPIRE_IN',
            '15m',
          ),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: jwtPayload.sub,
          organizationId: jwtPayload.organizationId,
          deviceId,
          jti: refreshTokenId,
          iat: Math.floor(timestamp / 1000),
        },
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
      jwtPayload,
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

  private filterSensitiveData(user: Partial<User>): Partial<User> {
    delete user.password;
    delete user.passwordResetCode;
    delete user.passwordResetCodeExpiresAt;
    return user;
  }
}
