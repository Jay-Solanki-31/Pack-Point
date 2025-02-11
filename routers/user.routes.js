import { Router } from "express";
import { requireAuth, verifyJWT, verifyRole } from "../middleware/auth.middleware.js";
import { redirectIfAuthenticated } from "../middleware/redirectIfAuthenticated.js";
import { Product } from "../models/product.model.js";
import { getAllProducts, getProducts } from "../controllers/user.controller.js";

export const router = Router();



router.get('/',getProducts);

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


router.get("/logout", verifyJWT, (req, res) => {
    res.redirect("/"); 
});


router.get("/Shop",verifyJWT, getAllProducts,(req,res)=>{
    res.render("user/shop")
})


export default router;
