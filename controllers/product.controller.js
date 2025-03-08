import { Product } from "../models/product.model.js";



const addProductController = async (req, res) => {
  try {
    let { title, description, price, sku } = req.body;

    if (!title || !description || !price || !sku || !req.files || req.files.length === 0) {
      req.session.toastMessage = { type: "error", text: "All fields are required." };
      return res.redirect("./products");
    }

    description = description.replace(/<\/?[^>]+(>|$)/g, "");
    description = description.replace(/&nbsp;/g, " ").trim();

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      req.session.toastMessage = { type: "error", text: "Price must be a positive number." };
      return res.redirect("./products");
    }

    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      req.session.toastMessage = { type: "error", text: "Product with the same SKU already exists." };
      return res.redirect("./products");
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

    req.session.toastMessage = { type: "success", text: "Product added successfully." };
    return res.redirect("./products");

  } catch (error) {
    req.session.toastMessage = { type: "error", text: "Error adding product." };
    return res.redirect("./products"); 
  }
};







// update product details 
const updateProductDetails = async (req, res) => {
  try {
      const productId = req.params.id;
      const product = await Product.findById(productId);

      if (!product) {
        req.session.toastMessage = { type: "error", text: "Product not found" };
        return res.redirect("/product/products");
      }

      let { title, description, price, code } = req.body;
      
      description = description.replace(/<\/?[^>]+(>|$)/g, "").replace(/&nbsp;/g, " ").trim();

      const newImgUrls = req.files && req.files.length > 0
          ? req.files.map((file) => file.path)
          : [];

      const imgUrls = [...product.imgUrls, ...newImgUrls];

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

      if (!updatedProduct) {
        req.session.toastMessage = { type: "error", text: "Error updating product" };
        return res.redirect("/product/products");
      }

      req.session.toastMessage = { type: "success", text: "Product updated successfully" };
      return res.redirect("/product/products");

  } catch (error) {
    console.error(error);
    req.session.toastMessage = { type: "error", text: "Error updating product" };
    return res.redirect("/product/products");
  }
};

  

 


export  { addProductController,updateProductDetails,  };
