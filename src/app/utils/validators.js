// src/app/utils/validators.js
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== "";
};

export const validateTime = (time) => {
  if (!time) return true;
  const re = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return re.test(time);
};
