import { Cart } from "./cart.model.js";
import { Product } from "../product/product.model.js";
import { ApiError } from "../../utils/ApiError.js";
import mongoose from "mongoose";

export const addToCartService = async ({ userId, productId, quantity }) => {
  const product = await Product.findOne({
    _id: productId,
    isActive: true,
    deletedAt: null,
  }).select("_id stock price discountPrice");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.stock <= 0) {
    throw new ApiError(400, "Product is out of stock");
  }

  const cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    if (quantity > product.stock) {
      throw new ApiError(400, "Requested quantity exceeds available stock");
    } else {
      const newCart = await Cart.create({
        user: userId,
        items: [
          {
            product: product._id,
            quantity,
          },
        ],
      });

      return newCart;
    }
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId,
  );

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    if (newQuantity > product.stock) {
      throw new ApiError(400, "Requested quantity exceeds available stock");
    }

    existingItem.quantity = newQuantity;
  } else {
    if (quantity > product.stock) {
      throw new ApiError(400, "Requested quantity exceeds available stock");
    }

    cart.items.push({
      product: product._id,
      quantity,
    });
  }

  await cart.save();

  return cart;
};

export const getCartService = async (userId) => {
  const cart = await Cart.findOne({
    user: userId,
  }).select("_id");

  if (!cart) {
    return {
      items: [],
      subtotal: 0,
    };
  }

  const result = await Cart.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
      },
    },

    {
      $unwind: "$items",
    },

    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "product",
      },
    },

    {
      $unwind: "$product",
    },

    {
      $addFields: {
        isAvailable: {
          $and: [
            "$product.isActive",
            {
              $eq: ["$product.deletedAt", null],
            },
            {
              $gt: ["$product.stock", 0],
            },
            {
              $gte: ["$product.stock", "$items.quantity"],
            },
          ],
        },
      },
    },

    {
      $addFields: {
        itemTotal: {
          $multiply: ["$product.price", "$items.quantity"],
        },
      },
    },

    {
      $addFields: {
        effectivePrice: {
          $cond: [
            {
              $and: [
                {
                  $ne: ["$product.discountPrice", null],
                },
                {
                  $lt: ["$product.discountPrice", "$product.price"],
                },
              ],
            },
            "$product.discountPrice",
            "$product.price",
          ],
        },
      },
    },

    {
      $addFields: {
        itemTotal: {
          $multiply: ["$effectivePrice", "$items.quantity"],
        },
      },
    },

    {
      $group: {
        _id: "$_id",

        user: {
          $first: "$user",
        },

        items: {
          $push: {
            product: "$product",
            quantity: "$items.quantity",
            effectivePrice: "$effectivePrice",
            itemTotal: "$itemTotal",
            isAvailable: "$isAvailable",
          },
        },

        subtotal: {
          $sum: {
            $cond: ["$isAvailable", "$itemTotal", 0],
          },
        },
      },
    },

    {
      $project: {
        _id: 0,
        user: 1,

        items: {
          $map: {
            input: "$items",
            as: "item",
            in: {
              product: {
                id: "$$item.product._id",
                name: "$$item.product.name",
                image: {
                  $arrayElemAt: ["$$item.product.images", 0],
                },
              },

              quantity: "$$item.quantity",
              effectivePrice: "$$item.effectivePrice",
              itemTotal: "$$item.itemTotal",
              isAvailable: "$$item.isAvailable",
            },
          },
        },

        subtotal: 1,
      },
    },
  ]);

  return (
    result[0] ?? {
      items: [],
      subtotal: 0,
    }
  );
};

export const updateCartItemService = async ({
  userId,
  productId,
  quantity,
}) => {
  const product = await Product.findOne({
    _id: productId,
    isActive: true,
    deletedAt: null,
  }).select("_id stock");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (quantity > product.stock) {
    throw new ApiError(400, "Requested quantity exceeds available stock");
  }

  const cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const item = cart.items.find((item) => item.product.toString() === productId);

  if (!item) {
    throw new ApiError(404, "Product not found in cart");
  }

  item.quantity = quantity;

  await cart.save();

  return cart;
};

export const removeCartItemService = async ({ userId, productId }) => {
  const cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const originalLength = cart.items.length;

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId,
  );

  if (cart.items.length === originalLength) {
    throw new ApiError(404, "Product not found in cart");
  }

  await cart.save();

  return cart;
};
