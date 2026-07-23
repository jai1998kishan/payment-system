import { toUserResponse } from "./user.mapper.js";
import { User } from "./user.model.js";
import { generateAccessToken, generateRefreshToken } from "./token.service.js";
import { hashToken } from "../../utils/crypto.js";
import { ApiError } from "../../utils/ApiError.js";
import { verifyToken } from "../../utils/jwt.js";
import { env } from "../../config/env.js";

export const signupService = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = 409;

    throw error;
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  return toUserResponse(user);
};

export const loginService = async ({ email, password }) => {
  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user) {
    throw new ApiError("Invalid email or password");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError("Invalid email or password");
  }

  const accessToken = generateAccessToken({
    sub: user._id.toString(),
  });

  const refreshToken = generateRefreshToken({
    sub: user._id.toString(),
  });

  const hashedRefreshToken = hashToken(refreshToken);

  // Step 8
  // Save hash.
  user.refreshToken = hashedRefreshToken;
  await user.save();

  return {
    user: toUserResponse(user),
    accessToken,
    refreshToken,
  };
};

export const refreshAccessTokenService = async (refreshToken) => {
  const payload = verifyToken({
    token: refreshToken,
    secret: env.JWT_REFRESH_SECRET,
  });

  const hashedToken = hashToken(refreshToken);

  const user = await User.findById(payload.sub);

  if (!user) {
    throw new ApiError(401, "Authentication required");
  }

  if (user.refreshToken !== hashToken) {
    throw new ApiError(401, "Authentication required");
  }

  const accessToken = generateAccessToken({
    sub: user._id.toString(),
  });

  return {
    accessToken,
  };
};

export const logoutService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.refreshToken = undefined;

  await user.save();
};
