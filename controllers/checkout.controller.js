import { Cart } from "../models/cart.model.js";
import { Order } from "../models/checkout.model.js";
import Razorpay from "razorpay";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZOR_PAY_KEY,
  key_secret: process.env.RAZOR_PAY_SECRET_KEY, 
});

const getOrderList = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/user/login");

    const cartItems = await Cart.find({ userId: req.user._id });
    res.render("user/checkout", { orders: cartItems });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).send({ success: false, message: "Error fetching cart items" });
  }
};
const placeOrder = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/user/login");

    const { firstName, lastName, email, phone, address, postcode, country, totalAmount } = req.body;

    const cartItems = await Cart.find({ userId: req.user._id });
    if (!cartItems.length) return res.redirect("/cart");

    const products = cartItems.flatMap((item) => {
      if (!item.products || !item.products.length) {
        throw new Error("Invalid product data in the cart.");
      }
      return item.products.map((product) => {
        if (!product.name || !product.quantity || !product.price) {
          throw new Error("Invalid product data in the cart.");
        }
        return {
          name: product.name,
          quantity: product.quantity,
          price: product.price,
        };
      });
    });

    const newOrder = new Order({
      userId: req.user._id,
      firstName,
      lastName,
      email,
      phone,
      address,
      postcode,
      country,
      products,
      total: totalAmount,
      paymentStatus: "Pending",
    });

    const savedOrder = await newOrder.save();

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: totalAmount * 100, 
      currency: "INR",
      receipt: `${savedOrder._id}`,
    });

    res.render("user/payment", {
      razorpayKey: process.env.RAZOR_PAY_KEY,
      orderId: razorpayOrder.id,
      amount: totalAmount,
      user: req.user,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).send({ success: false, message: "Error placing order" });
  }
};


const handlePaymentSuccess = async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    const crypto = await import("crypto");
    const hmac = crypto.createHmac("sha256", process.env.RAZOR_PAY_SECRET_KEY);
    hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const order = await Order.findOneAndUpdate(
      { _id: razorpayOrderId },
      { paymentStatus: "Paid", razorpayPaymentId, razorpaySignature },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, message: "Payment verified" });
  } catch (error) {
    console.error("Payment success handling failed:", error);
    res.status(500).send({ success: false, message: "Payment verification failed" });
  }
};


export { getOrderList, placeOrder, handlePaymentSuccess };
