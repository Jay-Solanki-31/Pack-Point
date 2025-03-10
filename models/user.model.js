import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            lowercase: true,
            trim: true,
            minlength: [3, "Username must be at least 3 characters long."],
            index: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/.+\@.+\..+/, "Please enter a valid email address."]
        },
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            minlength: [3, "Full name must be at least 3 characters long."],
            index: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters long."]
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            match: [/^\d{10,15}$/, "Please enter a valid phone number."]
        },
        address: {
            type: String,
            trim: true
        },
        userRole: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },
        refreshToken: {
            type: String
        },
        resetPasswordToken: { 
            type: String 
        }, 
        resetPasswordExpires: { 
            type: Date 
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    console.log(this.password);
    this.password = await bcrypt.hash(this.password, 10);
    console.log(this.password);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
            userRole: this.userRole
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m"
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d"
        }
    );
};

userSchema.methods.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex"); 
    this.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    return resetToken; 
};

export const User = mongoose.model("User", userSchema);
