import mongoose, { Schema } from "mongoose";

const OrderSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    postcode: { type: String, required: true },
    country: { type: String, required: true },
    products: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    total: { type: Number, required: true },
    paymentStatus: { type: String, default: "Pending" },
      razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,

    createdAt: { type: Date, default: Date.now },
  });
  

export const Order = mongoose.model("Order", OrderSchema);
