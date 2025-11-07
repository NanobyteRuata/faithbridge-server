export enum PERMISSION_DESCRIPTION {
  ORGANIZATION__EDIT = 'Edit the organization details',
  ACCESS_CODE__VIEW = 'View access codes',
  ACCESS_CODE__EDIT = 'Edit access codes',
  USER__VIEW = 'View any users',
  USER__EDIT = 'Edit any users',
  PROFILE__EDIT = 'Edit any profiles',
  MEMBERSHIP__EDIT = 'Edit memberships',
  STATUS__EDIT = 'Edit statuses',
  ROLE__VIEW = 'View roles',
  ROLE__EDIT = 'Edit roles',
  LOCATION_DATA__EDIT = 'Edit location data',
  GROUP__EDIT = 'Edit groups',
}

export const ACCESS_CODE_PERMISSIONS = Object.entries(PERMISSION_DESCRIPTION).filter(([permission]) => permission.endsWith('__VIEW')).reduce((acc, [permission, description]) => {
  acc[permission] = description;
  return acc;
}, {} as Record<string, string>);

export const PERMISSIONS = Object.keys(PERMISSION_DESCRIPTION).reduce((acc, key) => {
  acc[key] = key;
  return acc;
}, {} as Record<string, string>);