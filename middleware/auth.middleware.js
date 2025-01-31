import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// Middleware to verify JWT token
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.redirect("/admin"); 
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            return res.redirect("/admin"); 
        }

        req.user = user;  
        // console.log(req.user);
        
        next();
    } catch (error) {
        return res.redirect("/admin");
    }
});

// Middleware to verify user role
export const verifyRole = (role) => (req, res, next) => {
    if (!req.user) {
        return res.redirect("/admin"); 
    }

    if (req.user.userRole !== role) {
        return res.redirect(role === "admin" ? "/admin/dashboard" : "/user/user-login"); 
    }

    next();
};
