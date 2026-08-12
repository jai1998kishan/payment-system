import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import productRoutes from "../modules/product/product.routes.js";

import cartRoutes from "../modules/cart/cart.routes.js";

const router = Router();

router.use("/auth", authRoutes);

router.use("/product", productRoutes);

router.use("/cart", cartRoutes);

export default router;
