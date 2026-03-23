const User = require("../models/User");
const bcrypt = require("bcrypt");

// @desc    Update user profile (Name & Phone)
// @route   PUT /user/edit-profile
// @access  Private
exports.editProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    // Validate empty updates - return early if nothing is provided
    if (!name && !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update (name or phone).",
      });
    }

    // Optional phone format simple validation
    if (phone) {
      const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid phone number.",
        });
      }
    }

    // Find the current logged in user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Update only provided fields
    if (name) user.name = name;
    if (phone) user.phone = phone;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error("Edit Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during profile update.",
    });
  }
};

// @desc    Logout user & clear JWT cookie
// @route   POST /user/logout
// @access  Public (or Private)
exports.logoutUser = (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === "production" || process.env.USE_CLOUD === "true";
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    res.json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout.",
    });
  }
};

// @desc    Change user password
// @route   PUT /user/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Validate inputs
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both old and new passwords.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    // Find the current logged in user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check if old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect old password.",
      });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Save
    user.password = hashedNewPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password change.",
    });
  }
};
