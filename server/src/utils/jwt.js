import jwt from "jsonwebtoken";
import { ApiError } from "./ApiError.js";

export const signToken = ({ payload, secret, expiresIn }) => {
  // console.log("signToken...", payload, " ", secret, " ", expiresIn);
  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

// export const verifyToken = ({ token, secret }) => {
//   return jwt.verify(token, secret);
// };

export const verifyToken = ({ token, secret }) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      throw new ApiError(401, "Authentication required");
    }

    throw error;
  }
};
