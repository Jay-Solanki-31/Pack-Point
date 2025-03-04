import { Router } from "express";
import { verifyJWT, verifyRole } from "../middleware/auth.middleware.js";
import { redirectIfAuthenticated } from "../middleware/redirectIfAuthenticated.js";
import { deleteUser, getRegisterUserData } from "../controllers/user.controller.js";
import { getAllProductData, getorderDetails, latestOrder, TotalOrder, TotalProduct, TotalUser,  } from "../controllers/checkout.controller.js";
import { Order } from "../models/checkout.model.js";

export const router = Router();


router.get("/", redirectIfAuthenticated, (req, res) => {
    res.render("admin/login");
});

router.get("/dashboard", verifyJWT, verifyRole("admin"), 
TotalUser,
TotalProduct,
TotalOrder,
latestOrder,
);


router.get("/add-user", verifyJWT, verifyRole("admin"), (req, res) => {
    res.render("admin/add-user");
});

router.get("/user-list", verifyJWT, verifyRole("admin"), getRegisterUserData);

router.get('/order-list',verifyJWT,verifyRole("admin"),getAllProductData)

router.post("/delete-user", verifyJWT, verifyRole("admin"), deleteUser);

router.get("/order-details/:id", getorderDetails);


router.get("/profile", verifyJWT, verifyRole("admin"), async (req, res) => {
    try {
        const user = req.user; 

        res.render("admin/profile", {
            user: user 
        });
    } catch (error) {
        res.status(500).send("Server Error");
    }
});




router.get("/logout", verifyJWT, (req, res) => {
    res.redirect("/admin"); 
});

export default router;
