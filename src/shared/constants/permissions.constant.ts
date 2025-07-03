import { RESOURCE_ACTIONS } from './actions.constant';
import { RESOURCES } from './resources.constant';

export const PERMISSIONS = Object.keys(RESOURCES).reduce(
  (acc, resource) => {
    acc[resource] = {};
    for (const action of Object.values(RESOURCE_ACTIONS)) {
      acc[resource][action] = `${action}:${resource}`;
    }
    return acc;
  },
  {} as Record<string, Record<string, string>>,
);
