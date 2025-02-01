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
            const limit = 8;

            const totalProducts = await Product.countDocuments();
            const pagination = getPagination(totalProducts, page, limit);

            const products = await Product.find({})
                .skip((pagination.currentPage - 1) * limit)
                .limit(limit)
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

router.post("/updateProduct/:id", upload, updateProductDetails);


// Delete product
router.post("/admin/delete-product/:id", async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin/products');
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});



router.delete('/delete-image/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const { imgUrls } = req.body;

        // Remove image from array
        await Product.findByIdAndUpdate(productId, {
            $pull: { imgUrls: imgUrls }
        });

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;