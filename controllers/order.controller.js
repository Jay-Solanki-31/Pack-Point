// import { Cart } from "../models/cart.model.js";

// const getCartData = async (req, res) => {
//     try {
//       if (!req.user) return res.redirect("/user/login");
//       const userId = req.user.id;
//       const cart = await Cart.findOne({ userId })
//       res.render("user/cart", { cartlist: cart});
//     } catch (error) {
//       console.error("Error fetching cart:", error);
//       res.redirect("/cart");
//     }
//   };

//   export {getCartData}