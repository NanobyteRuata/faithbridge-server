export interface AccessCodePayload {
  id: number;
  name: string;
  permissions: string[];
  type: 'accessCode';
}
