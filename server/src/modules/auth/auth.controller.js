import { signupService } from "./auth.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const signup = asyncHandler(async (req, res) => {
  const user = await signupService(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", user));
});
