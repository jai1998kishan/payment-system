import { env } from "./env.js";

export const accessCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  samesite: "strict",
  maxAge: 15 * 60 * 1000,
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  samesite: "strict",
  maxAge: 7 * 24 * 60 * 1000,
};
