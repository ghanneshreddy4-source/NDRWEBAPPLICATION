// controllers/adminController.js
const User = require("../models/User");
const Course = require("../models/Course");
const Test = require("../models/Test");
const MajorTest = require("../models/MajorTest");
const Result = require("../models/Result");

// GET /api/admin/pending-users
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: "student", isApproved: false },
      order: [["createdAt", "DESC"]],
      attributes: ["id", "name", "email", "role", "isApproved", "createdAt"],
    });

    return res.json(users);
  } catch (err) {
    console.error("Get pending users error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/admin/approve-user/:id
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "student") {
      return res
        .status(400)
        .json({ message: "Only student accounts can be approved" });
    }

    user.isApproved = true;
    await user.save();

    return res.json({
      message: "User approved",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (err) {
    console.error("Approve user error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      order: [["createdAt", "DESC"]],
      attributes: { exclude: ["password"] },
    });

    return res.json(users);
  } catch (err) {
    console.error("Get all users error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStudents = await User.count({ where: { role: "student" } });
    const approvedStudents = await User.count({
      where: { role: "student", isApproved: true },
    });

    const totalCourses = await Course.count();
    const totalTests = await Test.count();
    const totalMajorTests = await MajorTest.count();
    const totalResults = await Result.count();

    return res.json({
      totalUsers,
      totalStudents,
      approvedStudents,
      totalCourses,
      totalTests,
      totalMajorTests,
      totalResults,
    });
  } catch (err) {
    console.error("Get stats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
