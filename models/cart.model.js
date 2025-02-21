import mongoose, { Schema } from "mongoose";

const CartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
      },
    ],
    total: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

CartSchema.pre("save", function (next) {
  this.total = this.products.reduce((acc, item) => acc + item.quantity * item.price, 0);
  next();
});

export const Cart = mongoose.model("Cart", CartSchema);
