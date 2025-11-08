import {
  Body,
  Controller,
  Get,
  Headers,
  Ip,
  Param,
  Patch,
  Post,
  Query,
  Req,
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
  HybridAuthRequest,
} from './interface/requests.interface';
import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
import { Permissions } from 'src/core/auth/decorators/permissions.decorator';
import { LogoutDto } from './dto/request/logout.dto';
import { ResetPasswordDto } from './dto/request/reset-password.dto';
import { ForgotPasswordDto } from './dto/request/forgot-password.dto';
import { PERMISSIONS } from 'src/shared/constants/permissions.constant';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { GetUsersDto } from './dto/query/get-users.dto';
import { HybridAuthGuard } from 'src/core/auth/guards/hybrid-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.USER__VIEW)
  getAll(@Req() { user }: HybridAuthRequest, @Query() query: GetUsersDto) {
    return this.userService.findAll(query, user.organizationId);
  }

  @Get('self')
  @UseGuards(JwtAuthGuard)
  getSelf(@Req() { user }: JwtAuthRequest) {
    return this.userService.findUniqueOrgUser({ userFilters: { id: user.sub } });
  }

  @Get(':id')
  @UseGuards(HybridAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.USER__VIEW)
  getOne(@Param('id') id: number) {
    return this.userService.findUniqueOrgUser({ userFilters: { id } });
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.USER__EDIT)
  register(@Req() { user }: JwtAuthRequest, @Body() registerDto: RegisterDto) {
    return this.userService.register(
      registerDto,
      user.sub,
      user.organizationId,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.USER__EDIT)
  update(@Req() { user }: JwtAuthRequest, @Body() updateDto: UpdateUserDto, @Param('id') id: number) {
    return this.userService.updateUser(id, updateDto, user.organizationId);
  }

  @Patch('self')
  @UseGuards(JwtAuthGuard)
  updateSelf(@Req() { user }: JwtAuthRequest, @Body() updateDto: UpdateUserDto) {
    delete updateDto.id;
    return this.userService.updateUser(user.sub, updateDto);
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
  logout(@Request() req: JwtAuthRequest, @Body() { refreshToken }: LogoutDto) {
    return this.userService.logout(req.user.sub, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  logoutAll(@Request() req: JwtAuthRequest) {
    return this.userService.logoutAll(req.user.sub);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() { email, organizationCode }: ForgotPasswordDto) {
    return await this.userService.sendPasswordResetCode(
      email,
      organizationCode,
    );
  }

  @Post('reset-password')
  async resetPassword(
    @Body() { email, code, newPassword, organizationCode }: ResetPasswordDto,
  ) {
    return await this.userService.resetPasswordWithCode(
      email,
      code,
      newPassword,
      organizationCode,
    );
  }
}
