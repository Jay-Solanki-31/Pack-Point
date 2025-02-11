import { Product } from "../models/product.model.js";
import { WhishList } from "../models/whislist.model.js"

const getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        // console.log(userId);
        
        const wishlist = await WhishList .findOne({ userId }).populate("products");
        // console.log(wishlist);
        

        res.render("user/wishlist", { wishlist: wishlist ? wishlist.products : [] });
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.redirect("/user/wishlist");
    }
};

const addToWishlist = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/auth/login"); 
        }

        const userId = req.user.id;
        const productId = req.params.productId;

        let wishlist = await WhishList.findOne({ userId });

        if (!wishlist) {
            wishlist = new WhishList({ userId, products: [productId] });
        } else {
            if (!wishlist.products.includes(productId)) {
                wishlist.products.push(productId);
            }
        }

        await wishlist.save();
        res.redirect("/wishlist");
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.redirect("/wishlist");
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;

        await WhishList.findOneAndUpdate(
            { userId },
            { $pull: { products: productId } }
        );  

        res.redirect("/wishlist");
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        res.redirect("/wishlist");
    }
};

export  { getWishlist, addToWishlist, removeFromWishlist };
