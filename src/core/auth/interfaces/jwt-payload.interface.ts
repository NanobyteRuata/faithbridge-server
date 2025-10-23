export interface UserJwtPayload {
  sub: number;
  organizationId?: number;
  isSuperAdmin: boolean;
  permissions: string[];
  type: 'user';
}
