import slugify from "slugify";

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
  console.log("imagess...", images);

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

export const getProductsService = async ({
  page = 1,
  limit = 10,
  search,
  minPrice,
  maxPrice,
}) => {
  const safeLimit = Math.min(limit, 50);

  const skip = (page - 1) * safeLimit;

  const matchStage = {
    isActive: true,
    deletedAt: null,
  };

  if (search) {
    matchStage.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  if (minPrice || maxPrice) {
    matchStage.price = {};
  }

  if (minPrice) {
    matchStage.price.$gte = minPrice;
  }

  if (maxPrice) {
    matchStage.price.$lte = maxPrice;
  }

  const result = await Product.aggregate([
    {
      $match: matchStage,
    },
    {
      $facet: {
        products: [
          {
            $sort: {
              createdAt: -1,
              _id: -1,
            },
          },
          {
            $skip: skip,
          },
          {
            $limit: safeLimit,
          },
          {
            $project: {
              _id: 0,
              id: "$_id",
              name: 1,
              price: 1,
              discountPrice: 1,
              image: {
                $arrayElemAt: ["$images", 0],
              },
            },
          },
        ],

        totalCount: [
          {
            $count: "count",
          },
        ],
      },
    },
  ]);

  const products = result[0].products;
  const totalItems = result[0].totalCount[0]?.count ?? 0;

  const totalPages = Math.ceil(totalItems / safeLimit);

  return {
    products,
    pagination: {
      page,
      limit: safeLimit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};
