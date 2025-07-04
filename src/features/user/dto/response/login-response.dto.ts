import { Permission, Role, User } from '@prisma/client';

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserWithRoleAndPermissions;
  deviceId: string;
}

export type UserWithRoleAndPermissions = User & {
  role: Role & { permissions: Permission[] };
};
