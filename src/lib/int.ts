export const intOrZero = (value: unknown): number => {
  const parsed = parseInt(value as string, 10);

  return isNaN(parsed) ? 0 : parsed;
};
