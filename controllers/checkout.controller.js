import { Cart } from "../models/cart.model.js";
import { Order } from "../models/checkout.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import Razorpay from "razorpay";
import path from "path";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import { mongoose } from "mongoose";

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

    const products = cartItems.flatMap((item) =>
      item.products.map((product) => ({
        productId: new mongoose.Types.ObjectId(product.product),
        name: product.name,
        quantity: product.quantity,
        price: product.price,
      }))
    );

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

    savedOrder.razorpayOrderId = razorpayOrder.id;
    await savedOrder.save();

    await Cart.deleteMany({ userId: req.user._id });

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
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;


    const crypto = await import("crypto");
    const hmac = crypto.createHmac("sha256", process.env.RAZOR_PAY_SECRET_KEY);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const orderExists = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!orderExists) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { paymentStatus: "Paid", razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature },
      { new: true }
    );


    res.status(200).json({ success: true, message: "Payment verified", order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

const getAllProductData = async (req, res) => {
  try {
    const search = req.query.search || "";

    let orderList;
    if (search.trim() !== "") {
      orderList = await Order.find({
        firstName: { $regex: search, $options: "i" }
      }).sort({ createdAt: -1 });
    } else {
      orderList = await Order.find().sort({ createdAt: -1 });
    }

    res.render("admin/order-list", { orderList });
  } catch (error) {
    res.status(500).json({ success: false, message: "error  data not found " })
  }
}



const getorderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;

    const orderDetails = await Order.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(orderId) } },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          address: 1,
          postcode: 1,
          country: 1,
          total: 1,
          paymentStatus: 1,
          createdAt: 1,
          "products.productId": 1,
          "products.name": 1,
          "products.quantity": 1,
          "products.price": 1,
          imageUrl: {
            $arrayElemAt: ["$productDetails.imgUrls", 0],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          firstName: { $first: "$firstName" },
          lastName: { $first: "$lastName" },
          email: { $first: "$email" },
          phone: { $first: "$phone" },
          address: { $first: "$address" },
          postcode: { $first: "$postcode" },
          country: { $first: "$country" },
          total: { $first: "$total" },
          paymentStatus: { $first: "$paymentStatus" },
          createdAt: { $first: "$createdAt" },
          products: {
            $push: {
              productId: "$products.productId",
              name: "$products.name",
              quantity: "$products.quantity",
              price: "$products.price",
              imageUrl: {
                $ifNull: ["$imageUrl", "/assets/images/no-image.jpg"],
              },
            },
          },
        },
      },
    ]);

    if (!orderDetails.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.render("admin/order-details", { order: orderDetails[0] });

  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ message: "Server error", error });
  }

}



// get latest order
const latestOrder = async (req, res, next) => {
  try {
    const order = await Order.find({}).limit(5);

    res.render("admin/dashboard", {
      order,
      total: req.total,
      product: req.product,
      totalOrder: req.totalOrder,
      User: req.User,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ message: "Server error", error });
  }
};



const TotalOrder = async (req, res, next) => {
  try {
    const total = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          totalOrder: { $sum: 1 },
        },

      },
    ]);

    // console.log(TotalOrder);


    req.total = total.length > 0 ? total[0].total : 0;
    req.totalOrder = total.length > 0 ? total[0].totalOrder : 0;

    next();
  } catch (error) {
    console.error("Error fetching total order details:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


const TotalProduct = async (req, res, next) => {
  try {
    const productCount = await Product.countDocuments();
    req.product = productCount;

    // console.log(req.product); 

    next();
  } catch (error) {
    console.error("Error fetching total product count:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const TotalUser = async (req, res, next) => {
  try {
    // console.log('total user is running');

    const userCount = await User.countDocuments({ userRole: "user" });
    // console.log( typeof userCount ,userCount);
    req.User = userCount;
    next();

  } catch (error) {
    console.error("Error fetching total product count:", error);
    res.status(500).json({ message: "Server error", error });
  }
}


const generateOrderReport = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Call function to generate PDF
    generateInvoicePDF(order, res);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Server error");
  }
};

// ✅ **PDF Generation Function**
const generateInvoicePDF = (order, res) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  // **Set Response Headers**
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="order_${order._id}.pdf"`);

  doc.pipe(res); // Stream PDF directly to browser

  // **1. Add Logo & Title**
  // const logoPath = path.resolve("public", "logo.png"); // Adjust path
  // doc.image(logoPath, 50, 30, { width: 100 });
  doc.fontSize(20).text("PACK POINT - Order Invoice", 200, 50, { align: "center", bold: true });
  doc.moveTo(50, 80).lineTo(550, 80).stroke();

  doc.moveDown();
  // **2. Order Summary (Table Format)**
  doc.fontSize(14).text("Order Summary", 50, doc.y, { bold: true });
  doc.moveDown();

  doc.fontSize(12).text(`Order ID: ${order._id}`, 50, doc.y);
  doc.moveDown(); // Moves to the next line

  doc.text(`Date: ${new Date(order.createdAt).toDateString()}`, 50, doc.y);
  doc.moveDown(); // Moves to the next line

  doc.text(`Payment Status: ${order.paymentStatus}`, 50, doc.y);
  doc.moveDown(); // Moves to the next line

  doc.text(`Total Amount: ${order.total}`, 50, doc.y);
  doc.moveDown(); // Moves to the next line

  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();


  // **3. Ordered Items Table**
  doc.fontSize(14).text("Ordered Items", 50, doc.y, { bold: true });
  doc.moveDown();

  // Table Headers
  doc.fontSize(12).text("Product Name", 50, doc.y, { bold: true });
  doc.text("Qty", 250, doc.y, { bold: true });
  doc.text("Unit Price", 350, doc.y, { bold: true });
  doc.text("Subtotal", 450, doc.y, { bold: true });

  doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
  doc.moveDown();

  // List Products in Table
  order.products.forEach(product => {
    doc.fontSize(12).text(product.name, 50, doc.y);
    doc.text(`${product.quantity}`, 250, doc.y);
    doc.text(`${product.price}`, 350, doc.y);
    doc.text(`${product.price * product.quantity}`, 450, doc.y);
    doc.moveDown();
  });

  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  // **4. Shipping Address (Row Format)**
  doc.fontSize(14).text("Shipping Address", 50, doc.y, { bold: true });
  doc.moveDown();

  // Correctly formatting shipping details
  doc.fontSize(12).text(`${order.firstName} ${order.lastName}`, 50, doc.y);
  doc.text(`${order.address}`, 50, doc.y + 15);
  doc.text(`${order.country}, ${order.postcode}`, 50, doc.y + 30);
  doc.text(`Contact No: ${order.phone}`, 50, doc.y + 45);

  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  // **5. Footer (Thank You Note & Support Info)**
  doc.fontSize(14).text("Thank you for your order!", 50, doc.y, { bold: true });
  doc.fontSize(12).text("For any support, contact us at support@packpoint.com", 50, doc.y + 20);

  doc.end(); // Close PDF
};





export {
  getOrderList,
  placeOrder,
  handlePaymentSuccess,
  getAllProductData,
  getorderDetails,
  latestOrder,
  TotalOrder,
  TotalProduct,
  TotalUser,
  generateOrderReport
};

