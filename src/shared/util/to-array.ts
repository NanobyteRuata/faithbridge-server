// Helper to transform single value or array to array
export const toArray = ({ value }: { value: any }) => {
  if (value === undefined || value === null) return undefined;
  return Array.isArray(value) ? value : [value];
};