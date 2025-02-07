import { Router } from "express";
import { requireAuth, verifyJWT, verifyRole } from "../middleware/auth.middleware.js";
import { redirectIfAuthenticated } from "../middleware/redirectIfAuthenticated.js";
import { Product } from "../models/product.model.js";

export const router = Router();



router.get("/", async (req, res) => {
    try {
        const Products = await Product.find();
        console.log(Products); 
        
        res.render("index", { Products }); 
    } catch (error) {
        console.error("Error fetching Products:", error);
        res.send('Error while fetching Products');
    }
});

router.get("/Register",  (req, res) => {
    res.render("user/user-register");
});

router.get("/login",  (req, res) => {
    res.render("user/user-login");
});

 router.get("/Profile", verifyJWT, requireAuth , async (req, res) => {
    try {
        const user = req.user; 
        // console.log(user);
        

        res.render("user/user-profile", {
            user: user 
        });
    } catch (error) {
        res.status(500).send("Server Error");
    }
});


// router.get("/logout", verifyJWT, (req, res) => {
//     res.redirect("/"); 
// });




export default router;
