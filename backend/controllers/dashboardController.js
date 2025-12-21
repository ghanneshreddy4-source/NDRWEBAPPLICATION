// backend/controllers/dashboardController.js
const { Op } = require("sequelize");
const Course = require("../models/Course");
const Topic = require("../models/Topic");
const Test = require("../models/Test");
const MajorTest = require("../models/MajorTest");
const Result = require("../models/Result");

exports.getStudentDashboardStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // -------------------------------
    // 1) Overall Progress
    // -------------------------------
    const totalTopics = await Topic.count();

    // ✅ FIX: Use numeric comparison properly (Sequelize.Op.gt)
    const completedTopics = await Result.count({
      where: {
        userId,
        score: { [Op.gt]: 0 },
      },
    });

    const overallProgress =
      totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

    // -------------------------------
    // 2) Average Score (Topic + Major)
    // -------------------------------
    const results = await Result.findAll({
      where: { userId },
      attributes: ["score", "totalMarks"],
    });

    let totalScore = 0;
    let totalMax = 0;

    results.forEach((r) => {
      // ✅ ensure numeric values only
      const s = typeof r.score === "number" ? r.score : 0;
      const m = typeof r.totalMarks === "number" ? r.totalMarks : 0;
      totalScore += s;
      totalMax += m;
    });

    const avgScore =
      totalMax === 0 ? 0 : Math.round((totalScore / totalMax) * 100);

    // -------------------------------
    // 3) Time Spent  (placeholder)
    // -------------------------------
    const timeSpent = "3h 15m";

    return res.json({
      overallProgress,
      avgScore,
      timeSpent,
      testsTaken: results.length,
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    return res.status(500).json({
      message: "Server error while fetching dashboard stats",
      error: err.message,
    });
  }
};
