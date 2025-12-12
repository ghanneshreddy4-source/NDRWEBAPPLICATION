// controllers/userController.js
const User = require("../models/User");
const Result = require("../models/Result");
const Test = require("../models/Test");
const MajorTest = require("../models/MajorTest");
const bcrypt = require("bcryptjs");

// Get logged in user profile
exports.getMe = async (req, res) => {
  // req.user is Sequelize instance
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    isApproved: req.user.isApproved,
  });
};

// Update profile (name, email)
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;

    await user.save();

    res.json({
      message: "Profile updated",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password are required" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is wrong" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get my test results
exports.getMyResults = async (req, res) => {
  try {
    const results = await Result.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Test, as: "test" },
        { model: MajorTest, as: "majorTest" },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(results);
  } catch (err) {
    console.error("Get my results error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
