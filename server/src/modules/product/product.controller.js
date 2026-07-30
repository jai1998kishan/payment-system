import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { createProductService } from "./product.service.js";

export const createProduct = asyncHandler(async (req, res) => {
  // console.log("in create product controller...");
  const product = await createProductService({
    body: req.body,
    files: req.files,
    user: req.user,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Product create successfully", product));
});
