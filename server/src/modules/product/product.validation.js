import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(3).max(100),

  description: z.string().trim().min(10),

  price: z.coerce.number().min(0),

  discountPrice: z.coerce.number().min(0).optional(),

  stock: z.coerce.number().int().min(0),
});
