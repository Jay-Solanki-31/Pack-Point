import mongoose, { Schema } from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: [true, "User ID is required."] 
  }, 
  firstName: { 
    type: String, 
    required: [true, "First name is required."], 
    trim: true 
  },
  lastName: { 
    type: String, 
    required: [true, "Last name is required."], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, "Email is required."], 
    match: [/.+\@.+\..+/, "Please enter a valid email address."] 
  },
  phone: { 
    type: String, 
    required: [true, "Phone number is required."], 
    match: [/^\d{10,15}$/, "Please enter a valid phone number."] 
  },
  address: { 
    type: String, 
    required: [true, "Address is required."], 
    trim: true 
  },
  postcode: { 
    type: String, 
    required: [true, "Postcode is required."], 
    match: [/^\d{4,10}$/, "Please enter a valid postcode."] 
  },
  country: { 
    type: String, 
    required: [true, "Country is required."], 
    trim: true 
  },
  products: [
    {
      productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product", 
        required: [true, "Product ID is required."] 
      },
      name: { 
        type: String, 
        required: [true, "Product name is required."], 
        trim: true 
      },
      quantity: { 
        type: Number, 
        required: [true, "Quantity is required."], 
        min: [1, "Quantity must be at least 1."] 
      },
      price: { 
        type: Number, 
        required: [true, "Price is required."], 
        min: [0, "Price must be a positive number."] 
      },
    },
  ],
  total: { 
    type: Number, 
    required: [true, "Total amount is required."], 
    min: [0, "Total must be a positive number."] 
  },
  paymentStatus: { 
    type: String, 
    enum: ["Pending", "Paid", "Failed"], 
    default: "Pending" 
  },
  razorpayOrderId: { type: String, trim: true },
  razorpayPaymentId: { type: String, trim: true },
  razorpaySignature: { type: String, trim: true },

  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

export const Order = mongoose.model("Order", OrderSchema);
