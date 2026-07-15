import { Router } from "express";
import { signup } from "./auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { signupSchema } from "./auth.validation.js";

const router = Router();

router.post("/signup", validate(signupSchema), signup);

export default router;
