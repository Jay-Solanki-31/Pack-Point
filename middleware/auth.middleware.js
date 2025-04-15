import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// Middleware to verify JWT token
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // console.log('verify jwt is running.....');
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            res.locals.user = null;
            return next();
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            res.locals.user = null;
            return next();
        }

        req.user = user;
        res.locals.user = user; 

        next();
    } catch (error) {
        res.locals.user = null;
        return next();
    }
});


// Middleware to verify user role
export const verifyRole = (role) => (req, res, next) => {
    try {
        if (!req.user) {
            return res.redirect("/admin"); 
        }

        if (req.user.userRole !== role) {
            return next({ statusCode: 403, message: "Access Denied: Unauthorized Role" });
        }

        next();
    } catch (error) {
        next(error); 
    }
};



export const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.redirect("/user/login"); 
    }
    next();
};
