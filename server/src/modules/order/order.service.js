import mongoose from "mongoose";
import { Cart } from "../cart/cart.model.js";
import { Product } from "../product/product.model.js";
import { Order } from "./order.model.js";
import { ApiError } from "../../utils/ApiError.js";

export const createOrderService = async ({ userId, idempotencyKey }) => {
  const existingOrder = await Order.findOne({
    user: userId,
    idempotencyKey,
  });

  if (existingOrder) {
    return {
      id: existingOrder._id,
      items: existingOrder.items,
      subtotal: existingOrder.subtotal,
      totalAmount: existingOrder.totalAmount,
      orderStatus: existingOrder.orderStatus,
      paymentStatus: existingOrder.paymentStatus,
    };
  }

  console.log(userId, "rferfrfrf");

  const cart = await Cart.findOne({
    user: userId,
  }).lean();

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  const productIds = cart.items.map((item) => item.product);

  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true,
    deletedAt: null,
  })
    .select("_id name price discountPrice stock images")
    .lean();

  if (products.length !== productIds.length) {
    throw new ApiError(400, "One or more products are no longer available");
  }

  const productMap = new Map(
    products.map((product) => [product._id.toString(), product]),
  );

  const orderItems = [];
  let subtotal = 0;

  for (const cartItem of cart.items) {
    const product = productMap.get(cartItem.product.toString());

    if (!product) {
      throw new ApiError(400, "Product is no longer available");
    }

    if (cartItem.quantity > product.stock) {
      throw new ApiError(400, `${product.name} does not have enough stock`);
    }

    const effectivePrice =
      product.discountPrice !== null && product.discountPrice < product.price
        ? product.discountPrice
        : product.price;

    const itemTotal = effectivePrice * cartItem.quantity;

    subtotal += itemTotal;

    orderItems.push({
      productId: product._id,
      name: product.name,
      price: effectivePrice,
      quantity: cartItem.quantity,
      itemTotal,
      image: product.images?.[0]?.url ?? null,
    });
  }

  try {
    const order = await Order.create({
      user: new mongoose.Types.ObjectId(userId),
      idempotencyKey,
      items: orderItems,
      subtotal,
      totalAmount: subtotal,
      orderStatus: "pending",
      paymentStatus: "pending",
    });

    return {
      id: order._id,
      items: order.items,
      subtotal: order.subtotal,
      totalAmount: order.totalAmount,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
    };
  } catch (error) {
    if (error.code === 11000) {
      const existingOrder = await Order.findOne({
        user: userId,
        idempotencyKey,
      });

      if (existingOrder) {
        return {
          id: existingOrder._id,
          items: existingOrder.items,
          subtotal: existingOrder.subtotal,
          totalAmount: existingOrder.totalAmount,
          orderStatus: existingOrder.orderStatus,
          paymentStatus: existingOrder.paymentStatus,
        };
      }
    }

    throw error;
  }
};
