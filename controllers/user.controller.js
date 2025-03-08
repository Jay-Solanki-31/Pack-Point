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
        req.session.toastMessage = { type: "error", text: "Error fetching products" };
        res.redirect("/");
    }
};


const getAllProducts = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = 12;
        let skip = (page - 1) * limit; 

        const products = await Product.find().skip(skip).limit(limit).sort({ createdAt: -1 });

        const totalProducts = await Product.countDocuments();

        const totalPages = Math.ceil(totalProducts / limit);

        res.render("user/shop", {
            products,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        req.session.toastMessage = { type: "error", text: "Error fetching products" };
        res.redirect("/");
    }
};

const getUserOrderData = async (req, res) => {
    try {
        if (!req.user) return res.redirect("/user/login");

        const getOrderList = await Order.find({ userId: req.user._id });

        // console.log("Fetched Orders:", getOrderList); 

        res.render("user/user-profile", { orders: getOrderList || [] });
    } catch (error) {
        req.session.toastMessage = { type: "error", text: "Error fetching orders" };
        res.redirect("/");
    }
};



const getRegisterUserData = async (req, res) => {
    try {
        const users = await User.find({ userRole: "user" }); 
        // console.log(users); 
        
        res.render("admin/user-list", { users });
    } catch (error) {
        req.session.toastMessage = { type: "error", text: "Error fetching users" };
        res.redirect("/admin/user-list");
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
        req.session.toastMessage = { type: "error", text: "Error deleting users" };
        res.redirect("/admin/user-list");
    }
};


const getSalesReport = async (req, res) => {
    try {
      const orders = await Order.find();
  
      const productSales = {};
  
      orders.forEach((order) => {
        order.products.forEach((product) => {
          if (productSales[product.name]) {
            productSales[product.name] += product.quantity * product.price;
          } else {
            productSales[product.name] = product.quantity * product.price;
          }
        });
      });
  
      res.render("admin/reports", { productSales }); 
    } catch (error) {
      req.session.toastMessage = { type: "error", text: "Error fetching sales report" };
      res.redirect("/admin/reports");
    }
  };
  


export {getProducts , getAllProducts,getUserOrderData, getRegisterUserData, deleteUser , getSalesReport};