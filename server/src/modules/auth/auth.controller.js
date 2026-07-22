import { refreshAccessTokenService, signupService } from "./auth.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { loginService } from "./auth.service.js";
import {
  accessCookieOptions,
  refreshCookieOptions,
} from "../../config/cookie.js";

export const signup = asyncHandler(async (req, res) => {
  const user = await signupService(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", user));
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await loginService(req.body);

  res.cookie("accessToken", accessToken, accessCookieOptions);

  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  return res.status(200).json(new ApiResponse(200, "Login successful", user));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiResponse(401, "Authentication required");
  }

  const { accessToken } = await refreshAccessTokenService(refreshToken);

  res.cookie("accessToken", accessToken, accessCookieOptions);

  return res.status(200).json(new ApiResponse(200, "Access token refreshed"));
});
