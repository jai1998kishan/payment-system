import { User } from "../modules/auth/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/jwt.js";
import { env } from "../config/env.js";

export const protect = asyncHandler(async (req, res, next) => {
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    throw new ApiError(401, "Authentication required");
  }

  const payload = verifyToken({
    token: accessToken,
    secret: env.JWT_ACCESS_SECRET,
  });

  const user = await User.findById(payload.sub);

  if (!user) {
    throw new ApiError(401, "authentication required");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been disabled");
  }

  req.user = {
    id: user._id.toString(),
    role: user.role,
  };

  next();
});
