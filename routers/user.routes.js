import express from "express";
// import { logoutUser, getCurrentUser, updateAccountDetails, changeCurrentPassword } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();
export default router;
