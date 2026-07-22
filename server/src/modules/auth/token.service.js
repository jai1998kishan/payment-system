import { env } from "../../config/env.js";
import { signToken } from "../../utils/jwt.js";

export const generateAccessToken = ({ sub, role }) => {
  return signToken({
    payload: {
      sub: user._id.toString(),
      role: user.role,
    },
    secret: env.JWT_ACCESS_SECRET,
    expiresIn: env.ACCESS_TOKEN_EXPIRES,
  });
};

export const generateRefreshToken = ({ sub }) => {
  return signToken({
    payload: {
      sub: user._id.toString(),
    },
    secret: env.JWT_REFRESH_SECRET,
    expiresIn: env.REFRESH_TOKEN_EXPIRES,
  });
};
