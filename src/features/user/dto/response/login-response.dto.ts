export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  deviceId: string;
  permissions?: string[];

  constructor(
    accessToken: string,
    refreshToken: string,
    deviceId: string,
    permissions?: string[],
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.deviceId = deviceId;
    this.permissions = permissions;
  }
}
