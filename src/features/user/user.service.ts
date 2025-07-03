import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../../core/auth/interfaces/jwt-payload.interface';
import { Tokens } from './interface/tokens.interface';
import { RegisterDto } from './dto/request/register.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginResponseDto } from './dto/response/login-response.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { username } });

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
    const tokens = await this.generateTokens(user, deviceId);

    // Store refresh token in database
    await this.storeRefreshToken(
      user.id,
      tokens.refreshToken,
      deviceId,
      userAgent,
      ipAddress,
    );

    return {
      ...tokens,
      deviceId,
    };
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const { username, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ForbiddenException('Username already exists');
    }

    // Hash password
    // eslint-disable-next-line
    const hashedPassword: string = await bcrypt.hash(password, 10);

    // Create user
    return this.prisma.user.create({
      data: {
        ...registerDto,
        phone: registerDto.phone[0],
        email: registerDto.email[0],
        password: hashedPassword,
        isActive: true,
        roleId: 1,
        profileId: 1,
      },
    });
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

  private async generateTokens(user: User, deviceId: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: user.id,
      username: user.username,
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
