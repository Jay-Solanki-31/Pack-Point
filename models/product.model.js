import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      lowercase: true,
      trim: true,
      minlength: [3, "Title must be at least 3 characters long."],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long."],
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
      min: [0, "Price must be a positive number."],
    },
    imgUrls: {
      type: [String],
      required: [true, "At least one image URL is required."],
      validate: {
        validator: function (value) {
          return value.length > 0;
        },
        message: "At least one image URL is required.",
      },
    },
    sku: {
      type: String,
      unique: true,
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 5,
      min: [1, "Rating must be at least 1."],
      max: [5, "Rating cannot exceed 5."],
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
