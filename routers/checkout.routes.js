import express from "express";

// import { getWishlist, addToWishlist ,removeFromWishlist } from "../controllers/whishList.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();
router.get("/", verifyJWT, (req,res)=>{
    res.render('user/checkout')
});

export default  router;
