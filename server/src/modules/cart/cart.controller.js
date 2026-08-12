import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import {
  addToCartService,
  getCartService,
  removeCartItemService,
  updateCartItemService,
} from "./cart.service.js";

export const addToCart = asyncHandler(async (req, res) => {
  const cart = await addToCartService({
    userId: req.user.id,
    ...req.validated.body,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Product added to cart successfully", cart));
});

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getCartService(req.user.id);

  return res.json(new ApiResponse(200, "Cart fetched successfully", cart));
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await updateCartItemService({
    userId: req.user.id,
    productId: req.params.productId,
    quantity: req.validated.body.quantity,
  });

  return res.json(new ApiResponse(200, "Cart item updated successfully", cart));
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await removeCartItemService({
    userId: req.user.id,
    productId: req.params.productId,
  });

  return res.json(new ApiResponse(200, "Cart item removed successfully", cart));
});
