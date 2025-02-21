import { Product } from "../models/product.model.js";
import { Cart } from "../models/cart.model.js";

const getCartList = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/user/login");
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId }).populate("products.product");
    res.render("user/cart", { cartlist: cart ? cart.products : [], total: cart ? cart.total : 0 });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.redirect("/cart");
  }
};

const addToCart = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/user/login");
    const userId = req.user.id;
    const productId = req.params.productId;

    const product = await Product.findById(productId);
    if (!product) {
      req.session.toastMessage = { type: "error", text: "Product not found" };
      return res.redirect("/cart");
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({
        userId,
        products: [{ product: productId, quantity: 1, price: product.price, name:product.title }],
      });
    } else {
      cart.products = cart.products.filter(
        (item) => item.product && typeof item.price === "number"
      );
      const index = cart.products.findIndex(
        (item) => item.product.toString() === productId
      );
      if (index > -1) {
        cart.products[index].quantity += 1;
        cart.products[index].price = product.price;
      } else {
        cart.products.push({ product: productId, quantity: 1, price: product.price,name:product.title }); 
      }
    }

    await cart.save(); 
    req.session.toastMessage = { type: "success", text: "Product added to cart" };
    res.redirect("/cart");
  } catch (error) {
    console.error("Error adding to cart:", error);
    req.session.toastMessage = { type: "error", text: "Error adding to cart" };
    res.redirect("/cart");
  }
};

const removeFromCart = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/user/login");
    const userId = req.user.id;
    const productId = req.params.productId;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.redirect("/cart");

    cart.products = cart.products.filter(
      (item) => item.product.toString() !== productId
    );
    await cart.save();

    req.session.toastMessage = { type: "success", text: "Product removed from cart" };
    res.redirect("/cart");
  } catch (error) {
    console.error("Error removing from cart:", error);
    req.session.toastMessage = { type: "error", text: "Error removing from cart" };
    res.redirect("/cart");
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, error: "Unauthorized" });
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    if (!productId || quantity < 1)
      return res.status(400).json({ success: false, error: "Invalid input" });

    const cart = await Cart.findOne({ userId });
    if (!cart)
      return res.status(404).json({ success: false, error: "Cart not found" });

    const index = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );
    if (index === -1)
      return res.status(404).json({ success: false, error: "Product not in cart" });

    cart.products[index].quantity = quantity;
    const product = await Product.findById(productId);
    if (product) {
      cart.products[index].price = product.price;
    }
    await cart.save();

    res.json({ success: true, updatedTotal: cart.total });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export { getCartList, addToCart, removeFromCart, updateCartQuantity };
