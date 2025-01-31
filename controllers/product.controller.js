import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { render } from "ejs";


const addProductController = async (req, res) => {
  try {
    let { title, description, price, sku } = req.body;

    if (!title || !description || !price || !sku || !req.files || req.files.length === 0) {
      return res.status(400).send("Please provide all required fields, including at least one image.");
    }

    description = description.replace(/<\/?[^>]+(>|$)/g, "");
    description = description.replace(/&nbsp;/g, " ").trim();

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).send("Price must be a valid positive number.");
    }

    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).send("Product with this SKU already exists.");
    }

    const imgUrls = req.files.map((file) => file.path);

    const newProduct = new Product({
      title,
      description,
      price: numericPrice,
      imgUrls,
      sku,
    });

    await newProduct.save();

    return res.redirect("./products");

  } catch (error) {
    console.error("Error in addProductController:", error);
    return res.status(500).send("An error occurred while adding the product.");
  }
};





// get all product details 
const getProductDetails = async (req, res) => {
    try {
        const product = await Product.find({});
        if (!product) {
            return res.status(401).send({
                message: "error to grting Data",
                error,
            });
        }

        res.status(200).json({
            message: true,
            totalProduct: product.length,
            product,
        });

    } catch (error) {
        // console.log(error),
        res.status(500).json('Server error');
        error
    }

}



// get product details by food id 
const getProductById = async (req, res) => {
    try {

        const ProductId = req.params.id;
        const getProductDetailsById = await Product.findById(ProductId);
        if (!getProductDetailsById) {
            res.status(401).send({
                message: "error While Geting Product",
            });
        }
        res.status(200).send({
            message: "Product Getting Success",
            getProductDetailsById,
        });
    } catch (error) {
        console.log(error),
            res.status(500).send("Server Error")
    }

}


// update product details 
const updateProductDetails = async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).send("Product not found");
      }
  
      const { title, description, price, code } = req.body;
  
      const imgUrls = req.files && req.files.length > 0
        ? req.files.map((file) => file.path)
        : product.imgUrls;
  
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
          title,
          description,
          price,
          imgUrls, 
          code,
        },
        { new: true }
      );
  
      res.status(200).send({
        success: true,
        message: "Product updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  };
  

// delete  a product items 
const deleteProductDetail = async (req, res) => {
    try {
        const productId = req.params.id
        // console.log(productId);
        const product = await Product.findById(productId);
        if (!product) { res.status(401).send("Please Provide product Id") };


        const deleteproduct = await Product.findByIdAndDelete(productId);

        if (!deleteproduct) { res.status(401).send("Details Not Delete") }

        res.status(200).send({
            success: true,
            message: "Product item Delete SuccessFully",
            deleteproduct
        })

    } catch (error) {
        res.status(500).send("Server Error")
        error
    }
}


 


export  { addProductController, getProductDetails, getProductById,updateProductDetails, deleteProductDetail };
