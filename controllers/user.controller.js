import { Product } from "../models/product.model.js";
import { Order } from "../models/checkout.model.js";
import { User } from "../models/user.model.js";
 const getProducts = async (req, res) => {
    try {
        const products = await Product.find().limit(8); 
        // console.log("Fetched Products:", products); 

        res.render("index", { products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send({ success: false, message: "Error fetching products" });
    }
};


const getAllProducts = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = 8;
        let skip = (page - 1) * limit; 

        const products = await Product.find().skip(skip).limit(limit);

        const totalProducts = await Product.countDocuments();

        const totalPages = Math.ceil(totalProducts / limit);

        res.render("user/shop", {
            products,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Server Error");
    }
};

const getUserOrderData = async (req, res) => {
    try {
        if (!req.user) return res.redirect("/user/login");

        const getOrderList = await Order.find({ userId: req.user._id });

        // console.log("Fetched Orders:", getOrderList); 

        res.render("user/user-profile", { orders: getOrderList || [] });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).send({ success: false, message: "Error fetching user orders" });
    }
};



const getRegisterUserData = async (req, res) => {
    try {
        const users = await User.find({ userRole: "user" }); 
        // console.log(users); 
        
        res.render("admin/user-list", { users });
    } catch (error) {
        console.error("Error while fetching user data:", error);
        res.status(500).send({ success: false, message: "Error fetching user data" });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userIds = req.body.userIds; 
        console.log(userIds);
        
        if (!userIds || userIds.length === 0) {
            return res.status(400).send({ success: false, message: "No users selected for deletion" });
        }

        await User.deleteMany({ _id: { $in: userIds } }); 

        res.redirect("/admin/user-list");
    } catch (error) {
        console.error("Error while deleting users:", error);
        res.status(500).send({ success: false, message: "Error deleting users" });
    }
};


export {getProducts , getAllProducts,getUserOrderData, getRegisterUserData, deleteUser}