import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { createOrder } from "./order.controller.js";

const router = Router();

router.post("/", protect, createOrder);

export default router;
