import { Product } from "../models/product.model.js";
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

export {getProducts , getAllProducts}