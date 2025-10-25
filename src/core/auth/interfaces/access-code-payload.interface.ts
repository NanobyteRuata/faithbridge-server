export interface AccessCodePayload {
  id: number;
  name: string;
  organizationId: number;
  permissions: string[];
  type: 'accessCode';
}
