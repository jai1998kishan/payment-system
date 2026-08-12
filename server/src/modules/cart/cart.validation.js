import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().trim().min(1),

  quantity: z.coerce.number().int().min(1).max(50),
});
