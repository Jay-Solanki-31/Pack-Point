import { Product } from "../models/product.model.js";
import { Cart } from "../models/cart.model.js";
import { Order } from "../models/order.model.js";

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
            cart = new Cart({ userId, products: [productId], });
        } else {
            if (!cart.products.includes(productId)) {
                cart.products.push(productId);
            }
        }

        await cart.save();
        req.session.toastMessage = { type: "success", text: "Product added to cart" };
        res.redirect("/cart");
    } catch (error) {
        req.session.toastMessage = { type: "error", text: "Error adding to cart" };
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
        req.session.toastMessage = { type: "success", text: "Product removed from cart" };
        res.redirect("/cart");
    } catch (error) {
        req,session.toastMessage = { type: "error", text: "Error removing from cart" };
        res.redirect("/cart");
    }
};


const proceedToCheckout = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/user/login");
        }

        const userId = req.user.id;
        // const {updateproduct} = req.body;
        // console.log(updateproduct);
        

        const cart = await Cart.findOne({ userId }).populate("products");

        if (!cart || cart.products.length === 0) {
            return res.redirect("/cart");
        }

        const order = new Order({
            userId,
            products: cart.products.map(product => ({
                productId: product._id,
                quantity: 1,
                price: product.price,
            })),
            totalAmount: cart.products.reduce((acc, product) => acc + product.price, 0),
        });

        await order.save();

        await Cart.findOneAndUpdate({ userId }, { $set: { products: [] } });

        res.redirect("/checkout");
    } catch (error) {
        console.error("Error during checkout:", error);
        res.redirect("/cart");
    }
};


export { getCartList, addToCart, removeFromCart,proceedToCheckout };
