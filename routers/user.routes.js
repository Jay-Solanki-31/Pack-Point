import { Router } from "express";
import { requireAuth, verifyJWT } from "../middleware/auth.middleware.js";
import { getAllProducts, getUserOrderData } from "../controllers/user.controller.js";
import { Order } from "../models/checkout.model.js";  
import { User } from "../models/user.model.js";

export const router = Router();

router.get("/Register", (req, res) => {
    res.render("user/user-register");
});

router.get("/login", (req, res) => {
    res.render("user/user-login");
});

router.get("/Profile", verifyJWT, requireAuth, async (req, res) => {
    try {
        const user = req.user;
        
        const orders = await Order.find({ userId: user._id });

        res.render("user/user-profile", {
            user: user,
            orders: orders || []  
        });
    } catch (error) {
        console.error("Error fetching user profile and orders:", error);
        res.status(500).send("Server Error");
    }
});

router.get("/logout", verifyJWT, (req, res) => {
    res.redirect("/");
});

router.get("/user/orders", verifyJWT, getUserOrderData);

router.get("/Shop", verifyJWT, getAllProducts, (req, res) => {
    res.render("user/shop");
});

router.get("/search", async (req, res) => {
    try {
        const search = req.query.search;
        // console.log("Search Query:", search);

        const users = await User.find({
            $or: [
                { username: { $regex: search, $options: "i" } }, 
                { fullName: { $regex: search, $options: "i" } }
            ]
        });

        res.render("admin/user-list", { users });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});


export default router;
