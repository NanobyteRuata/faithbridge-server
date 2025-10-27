export enum PERMISSION_DESCRIPTION {
  USER__CREATE = 'Create user',
  USER__VIEW = 'View any users',
  USER__VIEW_SELF = 'View self user',
  USER__UPDATE = 'Update any user details',
  USER__UPDATE_SELF = 'Update any self user details',
  USER__DELETE = 'Delete user',
  PROFILE__VIEW = 'View any profiles',
  PROFILE__VIEW_SELF = 'View self profile',
  PROFILE__CREATE = 'Create profile',
  PROFILE__UPDATE = 'Update any profile details',
  PROFILE__UPDATE_SELF = 'Update any self profile details',
  PROFILE__DELETE = 'Delete profile',
  ORGANIZATION__VIEW = 'View self organization',
  ORGANIZATION__UPDATE = 'Update any self organization details',
  MEMBERSHIP__VIEW = 'View memberships',
  MEMBERSHIP__CREATE = 'Create membership',
  MEMBERSHIP__UPDATE = 'Update membership details',
  MEMBERSHIP__DELETE = 'Delete membership',
  STATUS__VIEW = 'View statuses',
  STATUS__CREATE = 'Create status',
  STATUS__UPDATE = 'Update status details',
  STATUS__DELETE = 'Delete status',
}

export const PERMISSIONS = Object.keys(PERMISSION_DESCRIPTION).reduce((acc, key) => {
  acc[key] = key;
  return acc;
}, {} as Record<string, string>);