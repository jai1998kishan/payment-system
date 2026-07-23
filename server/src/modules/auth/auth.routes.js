import { Router } from "express";
import {
  login,
  logout,
  refreshAccessToken,
  signup,
} from "./auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { loginSchema, signupSchema } from "./auth.validation.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", validate(signupSchema), signup);

router.post("/login", validate(loginSchema), login);

router.post("/refresh", refreshAccessToken);

router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

router.post("/logout", protect, logout);

export default router;
