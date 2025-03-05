import { Cart } from "../models/cart.model.js";
import { Order } from "../models/checkout.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import Razorpay from "razorpay";
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
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).send("Order not found");
    }

    // Set response headers to open PDF in a new tab
    res.setHeader("Content-Disposition", `inline; filename=Order_${orderId}.pdf`);
    res.setHeader("Content-Type", "application/pdf");

    // Create PDF Document
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // **Header: PACK POINT**
    doc.fontSize(24).fillColor("blue").text("PACK POINT", { align: "center" });
    doc.moveDown(2);

    // **Order Report Title**
    doc.fontSize(20).fillColor("black").text("Order Report", { align: "center", underline: true });
    doc.moveDown(2);

    // **Order Details (Now in a Separate Row)**
    doc.fontSize(14).text(`Order ID: ${order._id}`);
    doc.text(`Order Date: ${new Date(order.createdAt).toDateString()}`);
    doc.text(`Customer: ${order.firstName} ${order.lastName}`);
    doc.text(`Phone: ${order.phone} `);
    doc.moveDown();

    // **Create Table for Products**
    const tableTop = doc.y; // Track starting position
    const itemX = 50;
    const qtyX = 250;
    const priceX = 350;
    const totalX = 450;
    const paymentX = 330;

    // **Table Headers**
    doc.fontSize(14).text("Product", itemX, tableTop, { bold: true });
    doc.text("Qty", qtyX, tableTop);
    doc.text("Price", priceX, tableTop);
    doc.text("Total", totalX, tableTop);
    doc.moveDown(0.5);

    // **Draw Header Line**
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // **Loop through products and add them to the table**
    order.products.forEach((product, index) => {
        let yPos = tableTop + 25 + index * 25; // Adjust row spacing

        doc.fontSize(12).text(product.name, itemX, yPos);
        doc.text(product.quantity.toString(), qtyX, yPos);
        doc.text(product.price.toString(), priceX, yPos);
        doc.text((product.quantity * product.price).toString(), totalX, yPos);
    });

    doc.moveDown(2);

    // **Draw Line Before Total**
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // **Total Amount**
    doc.fontSize(14).text(`Total Amount: ${order.total}`, totalX, doc.y, { bold: true });
    doc.fontSize(14).text(`Payment Status: ${order.paymentStatus}`, itemX, doc.y, { bold: true });

    doc.moveDown(2);


    // **Shipping Address (Now in a Row Format)**
    const addressText = `${order.firstName} ${order.lastName}, ${order.address}, ${order.country}, ${order.postcode}, Contact No: ${order.phone}`;

    // Set a fixed position for Shipping Address
    doc.fontSize(14).text("Shipping Address:", 50, doc.y, {width: 500, bold: true });
    doc.fontSize(12).text(addressText, 170, doc.y); // Align right side
    
    // mes feel free to purchase order
    doc.moveDown(2);
    doc.fontSize(14).text("Thank you for your purchase!", 50, doc.y, { width: 500, bold: true });
    
    doc.end(); // Finish the document

} catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Server error");
}
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

