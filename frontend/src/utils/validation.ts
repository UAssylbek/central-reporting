export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateRequired = (value: any): boolean => {
  return value !== null && value !== undefined && value !== "";
};

export const validatePeriod = (period: string): boolean => {
  return /^\d{4}-\d{2}$/.test(period);
};
