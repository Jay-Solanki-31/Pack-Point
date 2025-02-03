import { Router } from "express";
import { verifyJWT, verifyRole } from "../middleware/auth.middleware.js";
import { redirectIfAuthenticated } from "../middleware/redirectIfAuthenticated.js";

export const router = Router();


router.get("/Register", verifyJWT, verifyRole("user"), (req, res) => {
    res.render("user-register");
});

// router.get("/users", verifyJWT, verifyRole("admin"), (req, res) => {
//     res.render("admin/users");
// });


// router.get("/profile", verifyJWT, verifyRole("admin"), async (req, res) => {
//     try {
//         const user = req.user; 

//         res.render("admin/profile", {
//             user: user 
//         });
//     } catch (error) {
//         res.status(500).send("Server Error");
//     }
// });


// router.get("/logout", verifyJWT, (req, res) => {
//     res.redirect("/admin"); 
// });

export default router;
