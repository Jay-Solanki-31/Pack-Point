import mongoose, {Schema} from "mongoose";


const WishlistSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
      },
      products: [
        {
          type: Schema.Types.ObjectId,
          ref: "Product",
          unique: true,
        },
      ],
    },
    {timestamps: true });  

export const WhishList = mongoose.model('WhishList', WishlistSchema);

