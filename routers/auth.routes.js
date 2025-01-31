import express from "express";
import {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    getCurrentUser,
    updateAccountDetails,
    changeCurrentPassword,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { redirectIfAuthenticated } from "../middleware/redirectIfAuthenticated.js";

const router = express.Router();

router.post("/register", registerUser);

// Login route with if user already authenticated
router.post("/login", redirectIfAuthenticated, loginUser);

router.post("/refresh-token", refreshAccessToken);

router.post("/logout", verifyJWT, logoutUser);

router.get("/current-user", verifyJWT, getCurrentUser);

router.post("/update-account", verifyJWT, updateAccountDetails);

router.post("/change-password", verifyJWT, changeCurrentPassword);

export default router;
