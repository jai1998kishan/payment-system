import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(3).max(100),

  description: z.string().trim().min(10),

  price: z.coerce.number().min(0),

  discountPrice: z.coerce.number().min(0).optional(),

  stock: z.coerce.number().int().min(0),
});

export const getProductsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1), //Why coerce? => Query parameters are always strings. => Zod automatically converts:

  limit: z.coerce.number().int().min(1).max(50).default(10),

  search: z.string().trim().max(50).optional(),
});
