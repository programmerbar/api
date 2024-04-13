export const numberOrDefault = (value: unknown, def = 0): number => {
  const parsed = parseInt(value as string, 10);
  return isNaN(parsed) ? def : parsed;
};
