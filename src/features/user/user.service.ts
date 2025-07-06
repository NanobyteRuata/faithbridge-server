import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtUserPayload } from '../../core/auth/interfaces/jwt-payload.interface';
import { Tokens } from './interface/tokens.interface';
import { RegisterDto } from './dto/request/register.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { randomInt } from 'crypto';
import { EmailService } from 'src/shared/services/email.service';
import { ProfileService } from '../profile/profile.service';
import { RegisterResponseDto } from './dto/response/register-response.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private profileService: ProfileService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { role: { include: { permissions: true } } },
    });

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
  ): Promise<RegisterResponseDto> {
    const { username, email, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { username, OR: [{ email }] },
    });

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

  async sendPasswordResetCode(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const code = randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { email },
      data: {
        resetCode: code,
        resetCodeExpiresAt: expires,
      },
    });

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
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { email } });
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

    await this.prisma.user.update({
      where: { email },
      data: {
        password: hashed,
        resetCode: null,
        resetCodeExpiresAt: null,
      },
    });

    return true;
  }

  private async generateTokens(user: User, deviceId: string): Promise<Tokens> {
    const jwtPayload: JwtUserPayload = {
      sub: user.id,
      username: user.username,
      profileId: user.profileId,
      type: 'jwt',
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
