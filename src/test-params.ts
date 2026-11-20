import dotenv from 'dotenv';

dotenv.config();

export const testParams = {
  BASE_URL: process.env.BASE_URL,

  IVANOV_LOGIN: process.env.IVANOV_LOGIN,
  IVANOV_PASSWORD: process.env.IVANOV_PASSWORD,

  PETROVA_LOGIN: process.env.PETROVA_LOGIN,
  PETROVA_PASSWORD: process.env.PETROVA_PASSWORD,

  ADMIN_LOGIN: process.env.ADMIN_LOGIN,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,

  ACC_IVANOV_CURRENT: process.env.ACC_IVANOV_CURRENT,
  ACC_IVANOV_SAVINGS: process.env.ACC_IVANOV_SAVINGS,
  ACC_PETROVA_CURRENT: process.env.ACC_PETROVA_CURRENT,
  ACC_PETROVA_SAVINGS: process.env.ACC_PETROVA_SAVINGS,

  TOKEN_STORAGE_KEY: process.env.TOKEN_STORAGE_KEY
};
