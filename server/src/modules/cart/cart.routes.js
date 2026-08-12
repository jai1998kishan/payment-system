import { Router } from "express";

import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import {
  addToCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "./cart.controller.js";
import { addToCartSchema, updateCartItemSchema } from "./cart.validation.js";

const router = Router();

router.post("/items", protect, validate(addToCartSchema), addToCart);

router.get("/", protect, getCart);

router.patch(
  "/items/:productId",
  protect,
  validate(updateCartItemSchema),
  updateCartItem,
);

router.delete("/items/:productId", protect, removeCartItem);

export default router;
