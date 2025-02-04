import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import  { Product } from "../models/product.model.js";

 const getProducts = async (req, res) => {
    try {
        const products = await Product.find();  
        res.render("/", { products });   
    } catch (error) {
        res.status(500).send({ success: false, message: "Error fetching products" });
    }
};



export {
    getProducts,

}