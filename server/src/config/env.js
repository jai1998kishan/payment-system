import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI,
  CLIENT_URL: process.env.CLIENT_URL,
  JWT_SECRET: process.env.JWT_SECRET,

  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES,
};
