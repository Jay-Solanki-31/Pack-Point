import { Router } from "express";
import { verifyJWT, verifyRole } from "../middleware/auth.middleware.js";
import { redirectIfAuthenticated } from "../middleware/redirectIfAuthenticated.js";
import { deleteUser, getRegisterUserData } from "../controllers/user.controller.js";

export const router = Router();

router.get("/", redirectIfAuthenticated, (req, res) => {
    res.render("admin/login");
});

router.get("/dashboard", verifyJWT, verifyRole("admin"), (req, res) => {
    res.render("admin/dashboard");
});

router.get("/add-user", verifyJWT, verifyRole("admin"), (req, res) => {
    res.render("admin/add-user");
});

router.get("/user-list", verifyJWT, verifyRole("admin"), getRegisterUserData);

// router.get("/product-details", verifyJWT, verifyRole("admin"), getRegisterUserData);


router.post("/delete-user", verifyJWT, verifyRole("admin"), deleteUser);


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
