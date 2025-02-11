import express from "express";

import { getWishlist, addToWishlist ,removeFromWishlist } from "../controllers/whishList.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();
router.get("/", verifyJWT, getWishlist);
router.get("/add/:productId",verifyJWT , addToWishlist);
router.get("/remove/:productId", verifyJWT, removeFromWishlist);

export default  router;
