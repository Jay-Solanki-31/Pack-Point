import express from "express";
import {
  getCartList,
  addToCart,
  removeFromCart,
  updateCartQuantity,
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verifyJWT, getCartList);
router.get("/add/:productId", verifyJWT, addToCart);
router.get("/remove/:productId", verifyJWT, removeFromCart);
router.post("/update", verifyJWT, updateCartQuantity);

export default router;
