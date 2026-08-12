import { Router } from "express";

import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import { addToCart, getCart } from "./cart.controller.js";
import { addToCartSchema } from "./cart.validation.js";

const router = Router();

router.post("/items", protect, validate(addToCartSchema), addToCart);

router.get("/", protect, getCart);

export default router;
