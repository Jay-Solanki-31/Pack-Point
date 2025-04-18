import mongoose, { Schema } from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      match: [/.+\@.+\..+/, "Please enter a valid email address."],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required."],
      trim: true,
      minlength: [3, "Subject must be at least 3 characters long."],
    },
    message: {
      type: String,
      required: [true, "Message is required."],
      minlength: [10, "Message must be at least 10 characters long."],
      trim: true,
    },
    Phone: {
      type: String,
      required: [true, "Phone number is required."],
      length: [10, "Phone number must be 10 digits long."],
      trim: true,
    },
  },
  { timestamps: true }
);

export const Contact = mongoose.model("Contact", ContactSchema);
