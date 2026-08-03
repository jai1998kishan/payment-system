import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { uploadProductImages } from "../../middlewares/upload.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createProduct, getProducts } from "./product.controller.js";
import {
  createProductSchema,
  getProductsSchema,
} from "./product.validation.js";

const router = Router();

router.post(
  "/",
  protect,
  authorize("admin"),
  uploadProductImages.array("images", 5),
  validate(createProductSchema),
  createProduct,
);

router.get("/", validate(getProductsSchema, "query"), getProducts);

export default router;
