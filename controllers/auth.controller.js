import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";



const registerUser = asyncHandler(async (req, res) => {

    const { fullName, email, username, password, userRole } = req.body
    // console.log(req.body);

    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        req.session.toastMessage = { type: "error", text: "All Fields Require" };
        if (user.userRole === "admin") {
            return res.redirect("/admin");
        } else {
            return res.redirect("/user/login");
        }
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],

    })

    if (existedUser) {
        req.session.toastMessage = {type:error, text:"User AlreadyExists"}
        if (user.userRole === "admin") {
            return res.redirect("/admin");
        } else {
            return res.redirect("/user/login");
        }
    }
    //console.log(req.files);

    const user = await User.create({
        fullName,
        email,
        password,
        userRole,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        req.session.toastMessage = { type: "error", text: "User not Created" };
    }

    if (user.userRole === "admin") {
        req.session.toastMessage = { type: "success", text: "Admin Registered" };
        return res.redirect("/admin");
    } else {
        req.session.toastMessage = { type: "success", text: "User Registered" };
        return res.redirect("/user/login");
    }
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    try {
        if (!username && !email) {
            req.session.toastMessage = { type: "error", text: "Username or email is required" };
            if (user.userRole === "admin") {
                return res.redirect("/admin");
            } else {
                return res.redirect("/user/login");
            }
        }

        const user = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (!user) {
            req.session.toastMessage = { type: "error", text: "User does not exist" };
            return res.redirect("/login");
        }

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            req.session.toastMessage = { type: "error", text: "Invalid credentials" };
            return res.redirect("/login");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: true
        };

        res.cookie("accessToken", accessToken, options);
        res.cookie("refreshToken", refreshToken, options);

        // Redirect based on user role
        if (user.userRole === "admin") {
            req.session.toastMessage = { type: "success", text: "Welcome Admin!" };
            return res.redirect("/admin/dashboard");
        } else {
            req.session.toastMessage = { type: "success", text: "Login successful" };
            return res.redirect("/");
        }
    } catch (error) {
        req.session.toastMessage = { type: "error", text: error.message };
        return res.redirect("/login");
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
});



const changeCurrentPassword = asyncHandler(async (req, res) => {
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
    const { fullName, email,username,phone,address } = req.body;

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
});





export {
    registerUser,
    loginUser,
    refreshAccessToken,
    updateAccountDetails,
    getCurrentUser,
    changeCurrentPassword,
    logoutUser

}