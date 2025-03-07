import express from "express";
import { Product } from "../models/product.model.js";
import { upload } from "../utils/multer.config.js";
import { getPagination } from "../utils/pagination.js";

import { verifyJWT, verifyRole } from "../middleware/auth.middleware.js";
import {
    addProductController,
 
    updateProductDetails,
    
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/products",
    verifyJWT,
    verifyRole("admin"),
    async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 12;

            const totalProducts = await Product.countDocuments();
            const pagination = getPagination(totalProducts, page, limit);

            const products = await Product.find({})
                .skip((pagination.currentPage - 1) * limit)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec();

            res.render('admin/products', {
                products,
                pagination,
                title: "Product List"
            });
        } catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    });


router.get("/add-product", verifyJWT, verifyRole("admin"), (req, res) => {
    res.render("admin/add-product");
});

router.post("/add-product", verifyJWT, verifyRole("admin"), upload, addProductController);

router.get("/edit-product/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.render('admin/edit-product', { product });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
  });

router.post("/update-product/:id",verifyJWT, verifyRole("admin"), upload, updateProductDetails);


// Delete product
router.post("/delete-product/:id", async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect("/product/products");
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});


router.post("/delete-image", verifyJWT, verifyRole("admin"), async (req, res) => {
    try {
        const { productId, imageUrl } = req.body;
        const product = await Product.findById(productId);
        
        if (!product) return res.status(404).send("Product not found");

        product.imgUrls = product.imgUrls.filter(img => img !== imageUrl);
        await product.save();

        res.json({ success: true });
    } catch (error) {
        res.status(500).send("Server error");
    }
});

router.get("/product-details/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let view = "user/product-details";

        if (req.user && req.user.userRole === "admin") {
            view = "admin/product-details";
        }

        res.render(view, { product });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});


// search product based on title and get all data and send to product-details page with prodduct id
router.get("/search", async (req, res) => {
    try {
        const search = req.query.search; 
        // console.log(search);
        
        const products = await Product.find({ title: { $regex: search, $options: "i" } });
        // console.log(products);
        

        // if (products.length === 1) {
        //     return res.redirect(`/product/product-details/${products[0]._id}`);
        // }

        res.render('user/search-results', { products }); 

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});


export default router;