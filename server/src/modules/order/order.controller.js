import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { createOrderService } from "./order.service.js";
import { ApiError } from "../../utils/ApiError.js";

export const createOrder = asyncHandler(async (req, res) => {
  const idempotencyKey = req.get("Idempotency-Key");

  if (!idempotencyKey) {
    throw new ApiError(400, "Idempotency-Key is required");
  }

  const order = await createOrderService({
    userId: req.user.id,
    idempotencyKey,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Order created successfully", order));
});
