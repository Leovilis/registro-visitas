// src/app/utils/helpers.js
export const generateId = () => {
  return crypto.randomUUID();
};

export const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));