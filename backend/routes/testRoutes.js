// routes/testRoutes.js
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

// Normal tests
router.post("/", protect, adminAuth, createTest);
router.get("/by-topic/:topicId", protect, getTestsByTopic);
router.get("/:id", protect, getTestById);
router.put("/:id", protect, adminAuth, updateTest);
router.delete("/:id", protect, adminAuth, deleteTest);
router.post("/:id/submit", protect, submitTest);

// Major tests (weekly)
router.post("/major", protect, adminAuth, createMajorTest);
router.get("/major/by-course/:courseId", protect, getMajorTestsByCourse);
router.get("/major/:id", protect, getMajorTestById);
router.put("/major/:id", protect, adminAuth, updateMajorTest);
router.delete("/major/:id", protect, adminAuth, deleteMajorTest);
router.post("/major/:id/submit", protect, submitMajorTest);

module.exports = router;
