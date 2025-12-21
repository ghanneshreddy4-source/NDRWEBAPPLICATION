const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const {
  createTest,
  getTestsByTopic,
  getTestById,
  updateTest,
  deleteTest,
  submitTest,
  createMajorTest,
  getMajorTestsByCourse,
  getMajorTestById,
  updateMajorTest,
  deleteMajorTest,
  submitMajorTest,
} = require("../controllers/testController");

const Test = require("../models/Test");

// -------- Normal Tests --------
router.post("/", protect, adminAuth, createTest);
router.get("/by-topic/:topicId", protect, getTestsByTopic);
router.get("/:id", protect, getTestById);
router.put("/:id", protect, adminAuth, updateTest);
router.delete("/:id", protect, adminAuth, deleteTest);
router.post("/:id/submit", protect, submitTest);

// ✅ Remove a single question from a test
router.delete("/:testId/questions/:index", protect, adminAuth, async (req, res) => {
  try {
    const { testId, index } = req.params;
    const test = await Test.findByPk(testId);
    if (!test) return res.status(404).json({ message: "Test not found" });

    const questions = test.questions || [];
    const idx = parseInt(index, 10);
    if (idx < 0 || idx >= questions.length)
      return res.status(400).json({ message: "Invalid question index" });

    questions.splice(idx, 1);
    test.questions = questions;
    await test.save();

    res.json({ success: true, message: "Question removed successfully", questions });
  } catch (err) {
    console.error("❌ Error removing question:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Delete entire test (alias of existing delete route)
router.delete("/:testId/full", protect, adminAuth, async (req, res) => {
  try {
    const { testId } = req.params;
    const deleted = await Test.destroy({ where: { id: testId } });
    if (!deleted) return res.status(404).json({ message: "Test not found" });
    res.json({ success: true, message: "Test deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting test:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// -------- Major Tests --------
router.post("/major", protect, adminAuth, createMajorTest);
router.get("/major/by-course/:courseId", protect, getMajorTestsByCourse);
router.get("/major/:id", protect, getMajorTestById);
router.put("/major/:id", protect, adminAuth, updateMajorTest);
router.delete("/major/:id", protect, adminAuth, deleteMajorTest);
router.post("/major/:id/submit", protect, submitMajorTest);

module.exports = router;
