import { slugify } from "slugify";

import { Product } from "./product.model.js";

import {
  deleteImage,
  uploadImages,
} from "../../services/storage/storage.service.js";

import { ApiError } from "../../utils/ApiError.js";
import { lowercase } from "zod";

export const createProductService = async ({ body, files, user }) => {
  const { name, description, price, discountPrice, stock } = body;

  const slug = slugify(name, {
    lower: true,
    strict: true, // make special character disapper
  });

  const existingProduct = await Product.findOne({ slug }).select("_id");

  if (existingProduct) {
    throw new ApiError(409, "Product already exists");
  }

  const images = await uploadImages(files);

  let product;

  try {
    product = await Product.create({
      name,
      slug,
      description,
      price,
      discountPrice,
      stock,
      images,
      createdBy: user.id,
    });
  } catch (error) {
    await Promise.all(images.map((image) => deleteImage(image.key)));

    throw error;
  }

  return {
    id: product._id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    discountPrice: product.discountPrice,
    stock: product.stock,
    images: product.images,
  };
};
