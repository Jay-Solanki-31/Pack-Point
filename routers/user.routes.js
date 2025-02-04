import { Router } from "express";
import { verifyJWT, verifyRole } from "../middleware/auth.middleware.js";
import { redirectIfAuthenticated } from "../middleware/redirectIfAuthenticated.js";
import { Product } from "../models/product.model.js";

export const router = Router();



router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        console.log(products); 
        
        res.render("index", { products }); 
    } catch (error) {
        console.error("Error fetching products:", error);
        res.send('Error while fetching products');
    }
});



router.get("/Register",  (req, res) => {
    res.render("user/user-register");
});

router.get("/login",  (req, res) => {
    res.render("user/user-login");
});




export default router;
