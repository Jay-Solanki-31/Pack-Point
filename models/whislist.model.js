import mongoose, {Schema} from "mongoose";


const WishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    }],
}, {timestamps:true});

export const WhishList = mongoose.model('WhishList', WishlistSchema);

