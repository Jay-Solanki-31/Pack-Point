import express from "express";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { getOrderList ,placeOrder,handlePaymentSuccess } from "../controllers/checkout.controller.js";


const router = express.Router();
router.get("/", verifyJWT ,getOrderList);
router.post("/place-order", verifyJWT, placeOrder);
router.post("/payment/success", (req, res, next) => {
    // console.log("📢 Payment Success Route Hit! Data:", req.body);
    next();
  }, handlePaymentSuccess);
  

export default  router;
