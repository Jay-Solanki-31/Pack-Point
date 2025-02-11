import { Product } from "../models/product.model.js";
import { Cart } from "../models/cart.model.js";

const getCartList = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/user/login");
        }

        const userId = req.user.id;
        const cart = await Cart.findOne({ userId }).populate("products");

        res.render("user/cart", { cartlist: cart ? cart.products : [] });
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.redirect("/cart");
    }
};

const addToCart = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/user/login");
        }

        const userId = req.user.id;
        const productId = req.params.productId;

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, products: [productId] });
        } else {
            if (!cart.products.includes(productId)) {
                cart.products.push(productId);
            }
        }

        await cart.save();
        res.redirect("/cart");
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.redirect("/cart");
    }
};

const removeFromCart = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/user/login");
        }

        const userId = req.user.id;
        const productId = req.params.productId;

        await Cart.findOneAndUpdate(
            { userId },
            { $pull: { products: productId } }
        );

        res.redirect("/cart");
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.redirect("/cart");
    }
};

export { getCartList, addToCart, removeFromCart };
