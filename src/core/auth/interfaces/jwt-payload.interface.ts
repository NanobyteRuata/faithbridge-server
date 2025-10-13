export interface UserJwtPayload {
  sub: number;
  username: string;
  name: string;
  organizationId?: number;
  organizationName?: string;
  isSuperAdmin: boolean;
  roleName: string | null;
  permissions: string[] | null;
  type: 'user';
}

export interface AccessCodeJwtPayload {
  id: number;
  name: string;
  organizationId?: number;
  organizationName?: string;
  permissions: string[];
  type: 'accessCode';
}
