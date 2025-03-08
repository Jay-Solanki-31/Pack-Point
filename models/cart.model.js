import mongoose, { Schema } from "mongoose";

const CartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required."],
    },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product ID is required."],
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, "Quantity must be at least 1."],
        },
        price: {
          type: Number,
          required: [true, "Price is required."],
          min: [0, "Price must be a positive number."],
        },
        name: {
          type: String,
          required: [true, "Product name is required."],
          trim: true,
        },
      },
    ],
    total: {
      type: Number,
      default: 0,
      min: [0, "Total price must be a positive number."],
    },
  },
  { timestamps: true }
);

// Pre-save hook to calculate total
CartSchema.pre("save", function (next) {
  this.total = this.products.reduce((acc, item) => acc + item.quantity * item.price, 0);
  next();
});

export const Cart = mongoose.model("Cart", CartSchema);
