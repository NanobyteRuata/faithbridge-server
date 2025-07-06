export interface JwtUserPayload {
  sub: number;
  username: string;
  profileId: number;
  type: 'jwt';
}

export interface AccessCodeUserPayload {
  id: number;
  permissions: string[];
  type: 'accessCode';
}
