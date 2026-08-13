import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
  quantity: z.coerce.number().int().min(1).max(50),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(50),
});
