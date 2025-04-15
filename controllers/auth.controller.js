import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendEmail } from "../utils/emailService.js";
import dotenv from "dotenv";

dotenv.config();



const registerUser = asyncHandler(async (req, res) => {
    try {

        const { fullName, email, username, password, userRole } = req.body
        // console.log(req.body);

        if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
            req.session.toastMessage = { type: "error", text: "All Fields Require" };
            return res.redirect("/user/register");
        }

        const existedUser = await User.findOne({
            $or: [{ username }, { email }],
        })
        // console.log(existedUser);
        

        if (existedUser) {
            req.session.toastMessage = { type: "error", text: "User Already Existed" };
            return res.redirect("/user/register");
        }

        const user = await User.create({
            fullName,
            email,
            password,
            userRole,
            username: username.toLowerCase()
        })
        // console.log(`Insert user ${user}`);
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
        // console.log(`creatred user data is ${createdUser}`)
        if (!createdUser) {
            req.session.toastMessage = { type: "error", text: "User not Created" };
        }
        
        req.session.toastMessage = { type: "success", text: "User Registered" };
        return res.redirect("/user/login");

    }catch (error) {
        // console.error(error);

        if (error.name === "ValidationError") {
            const firstErrorMessage = Object.values(error.errors)[0].message;
            req.session.toastMessage = { type: "error", text: firstErrorMessage };
        } else {
            req.session.toastMessage = { type: "error", text: "Error Registering User" };
        }

        res.redirect("/user/register");
    }

});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    try {
        if (!username && !email) {
            req.session.toastMessage = { type: "error", text: "Username or email is required" };
            return res.redirect("/user/login");
        }

        const user = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (!user) {
            req.session.toastMessage = { type: "error", text: "User does not exist" };
            return res.redirect("/user/login");
        }

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            req.session.toastMessage = { type: "error", text: "Invalid credentials" };
            return res.redirect("/user/login");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: true
        };

        res.cookie("accessToken", accessToken, options);
        res.cookie("refreshToken", refreshToken, options);

        req.session.toastMessage = {
            type: "success",
            text: user.userRole === "admin" ? "Welcome Admin!" : "Welcome To PACK POINT!"
        };

        return res.redirect(user.userRole === "admin" ? "/admin/dashboard" : "/");
    } catch (error) {
        if (error.name === "ValidationError") {
            const firstErrorMessage = Object.values(error.errors)[0].message;
            req.session.toastMessage = { type: "error", text: firstErrorMessage };
        } else {
            req.session.toastMessage = { type: "error", text: "Error while login User" };
        }
        res.redirect("/user/login");
    }
});



const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}




const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    // console.log(incomingRefreshToken);


    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)
        // console.log(user);


        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")

        }

        const options = {
            httpOnly: true,
            secure: true
        }


        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)
        // console.log(newRefreshToken);


        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})



const logoutUser = asyncHandler(async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            req.session.toastMessage = { type: "error", text: "User not logged in" };
            if (user.userRole === "admin") {
                return res.redirect("/admin");
            } else {
                return res.redirect("/user/login");
            }
        }

        // Remove refresh token from database
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $unset: { refreshToken: 1 } },
            { new: true }
        );

        if (!updatedUser) {
            req.session.toastMessage = { type: "error", text: "User not found" };
            if (user.userRole === "admin") {
                return res.redirect("/admin");
            } else {
                return res.redirect("/user/login");
            }
        }


        // Clear authentication cookies
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
        };

        res.clearCookie("accessToken", options);
        res.clearCookie("refreshToken", options);

        // Redirect based on user role
        if (req.user.userRole === "admin") {
            req.session.toastMessage = { type: "success", text: "Logout successful" };
            return res.redirect("/admin");
        } else {
            req.session.toastMessage = { type: "success", text: "Logout successful" };
            return res.redirect("/");
        }
    } catch (error) {
        req.session.toastMessage = { type: "error", text: error.message };
        if (user.userRole === "admin") {
            return res.redirect("/admin");
        } else {
            return res.redirect("/user/login");
        }
    }
});



const changeCurrentPassword = asyncHandler(async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body
        // console.log(req.body);

        const user = await User.findById(req.user?._id)
        // console.log(user);

        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

        if (!isPasswordCorrect) {
            req.session.toastMessage = { type: "error", text: "Old password is incorrect" };
        }

        user.password = newPassword
        await user.save({ validateBeforeSave: false })

        if (req.user.userRole === "admin") {
            req.session.toastMessage = { type: "success", text: "Password changed successfully" };
            return res.redirect("/admin");
        } else {
            req.session.toastMessage = { type: "success", text: "Password changed successfully" };
            return res.redirect("/user/Profile");
        }
    } catch (error) {
        req.session.toastMessage = { type: "error", text: error.message };
        if (user.userRole === "admin") {
            return res.redirect("/admin");
        } else {
            return res.redirect("/user/Profile");
        }
    }


})


const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        ))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    try {
        const { fullName, email, username, phone, address } = req.body;

        // if (!fullName && !email ) {
        //     throw new ApiError(400, "At least one field (fullName or email) must be provided");
        // }

        let updateFields = {};
        if (fullName) updateFields.fullName = fullName;
        if (email) updateFields.email = email;
        if (username) updateFields.username = username;
        if (phone) updateFields.phone = phone;
        if (address) updateFields.address = address;

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            { $set: updateFields },
            { new: true }
        ).select("-password");

        if (!user) {
            req.session.toastMessage = { type: "error", text: "User not found" };
        }

        // Redirect based on user role
        if (user.userRole === "admin") {
            req.session.toastMessage = { type: "success", text: "Account details updated successfully" };
            return res.redirect("/admin/dashboard");
        } else {
            req.session.toastMessage = { type: "success", text: "Account details updated successfully" };
            return res.redirect("/user/Profile");
        }
    } catch (error) {
        req.session.toastMessage = { type: "error", text: error.message };
        if (user.userRole === "admin") {
            return res.redirect("/admin/dashboard");
        } else {
            return res.redirect("/user/Profile");
        }
    }
});
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        // console.log(email);
        const user = await User.findOne({ email });
        // console.log(user);/

        if (!user) {
            req.session.toastMessage = { type: "error", text: "User not found" };
            return res.status(404).json({ message: "User not found" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/user/reset-password/${resetToken}`;

        const subject = "Reset Your Password";
        const text = `You requested a password reset. Click the link below:\n\n${resetUrl}`;
        const html = `<p>You requested a password reset. Click the link below:</p><a href="${resetUrl}">${resetUrl}</a>`;

        await sendEmail(user.email, subject, text, html);

        req.session.toastMessage = { type: "success", text: "Reset password link sent to your email." };
        return res.redirect("/user/login");
    } catch (error) {
        req.session.toastMessage = { type: "error", text: "Server error" };
        return res.status(500).json({ message: "Server error" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        // console.log(token);
        const { newPassword } = req.body;
        // console.log(newPassword);

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            req.session.toastMessage = { type: "error", text: "Invalid or expired token" };
            return res.redirect("/user/login");
        }

        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        req.session.toastMessage = { type: "success", text: "Password reset successfully. Please log in." };
        return res.redirect("/user/login");
    } catch (error) {
        req.session.toastMessage = { type: "error", text: "Server error" };
        return res.status(500).json({ message: "Server error" });

    }
};



export {
    registerUser,
    loginUser,
    refreshAccessToken,
    updateAccountDetails,
    getCurrentUser,
    changeCurrentPassword,
    logoutUser,
    forgotPassword,
    resetPassword

}