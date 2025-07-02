import {
  Body,
  Controller,
  Headers,
  Ip,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginRequestDto } from './dto/request/login-request.dto';
import { v4 as uuidv4 } from 'uuid';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RefreshTokenDto } from './dto/request/refresh-token.dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { RegisterDto } from './dto/request/register.dto';
import {
  LocalAuthRequest,
  JwtRefreshRequest,
  JwtAuthRequest,
} from './interface/requests.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.userService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @Request() req: LocalAuthRequest,
    @Body() loginDto: LoginRequestDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
  ) {
    const deviceId = loginDto.deviceId || uuidv4();
    return this.userService.login(req.user, deviceId, userAgent, ip);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refreshTokens(
    @Request() req: JwtRefreshRequest,
    @Body() refreshTokenDto: RefreshTokenDto,
  ) {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;
    const deviceId = refreshTokenDto.deviceId;

    if (!deviceId) {
      throw new UnauthorizedException('Device ID is required');
    }

    return this.userService.refreshTokens(userId, refreshToken, deviceId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(
    @Request() req: JwtAuthRequest,
    @Body() body: { refreshToken: string },
  ) {
    return this.userService.logout(req.user.sub, body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  logoutAll(@Request() req: JwtAuthRequest) {
    return this.userService.logoutAll(req.user.sub);
  }
}
