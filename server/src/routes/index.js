import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import productRoutes from "../modules/product/product.routes.js";

const router = Router();

router.use("/auth", authRoutes);

router.use("/product", productRoutes);

export default router;
