import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const redirectIfAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return next(); 
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);

        if (!user) {
            return next(); 
        }

        if (user.userRole === "admin") {
            return res.redirect("/admin/dashboard");
        } else {
            return res.redirect("/user/index");
        }
    } catch (error) {
        return next(); 
    }
};
