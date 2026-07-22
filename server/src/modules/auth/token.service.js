import { env } from "../../config/env.js";
import { signToken } from "../../utils/jwt.js";

export const generateAccessToken = ({ sub }) => {
  // console.log("generateAccessToken...", sub);
  return signToken({
    payload: {
      sub: sub,
    },
    secret: env.JWT_ACCESS_SECRET,
    expiresIn: env.ACCESS_TOKEN_EXPIRES,
  });
};

export const generateRefreshToken = ({ sub }) => {
  // console.log("generateRefreshToken...", sub);
  return signToken({
    payload: {
      sub: sub,
    },
    secret: env.JWT_REFRESH_SECRET,
    expiresIn: env.REFRESH_TOKEN_EXPIRES,
  });
};
