import express from "express";
import { Product } from "../models/product.model.js"; 
import { upload } from "../utils/multer.config.js";
import { verifyJWT, verifyRole } from "../middleware/auth.middleware.js";
import {
  addProductController,
  getProductDetails,
  getProductById,
  updateProductDetails,
  deleteProductDetail,
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/products", 
  verifyJWT, 
  verifyRole("admin"), 
  async (req, res) => {
    try {
        const products = await Product.find({});
        res.render('admin/products', { 
            products: products,
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

// Edit product
router.get("/admin/edit-product/:id", async (req, res) => {
  try {
      const product = await Product.findById(req.params.id);
      res.render('admin/edit-product', { product });
  } catch (error) {
      res.status(500).json({ message: "Server error", error });
  }
});

// Delete product
router.post("/admin/delete-product/:id", async (req, res) => {
  try {
      await Product.findByIdAndDelete(req.params.id);
      res.redirect('/admin/products');
  } catch (error) {
      res.status(500).json({ message: "Server error", error });
  }
});


router.get("/getProduct", getProductDetails);
router.get("/getproductByid/:id", getProductById);
router.put("/updateProduct/:id", upload, updateProductDetails); 
router.delete("/deleteProduct/:id", deleteProductDetail);

export default router;