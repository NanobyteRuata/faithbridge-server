import { User } from "@prisma/client";

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  deviceId: string;
  email: string;
  permissions: string[];

  constructor(
    accessToken: string,
    refreshToken: string,
    deviceId: string,
    email: string,
    permissions?: string[],
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.deviceId = deviceId;
    this.permissions = permissions || [];
    this.email = email;
  }
}
