import { User } from '@prisma/client';

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: User;
  deviceId: string;

  constructor(
    accessToken: string,
    refreshToken: string,
    user: User,
    deviceId: string,
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.deviceId = deviceId;

    // Exclude sensitive info
    // eslint-disable-next-line
    const { password, resetCode, resetCodeExpiresAt, ...rest } = user;
    this.user = rest as User;
  }
}
