// routes/courseRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  createTopic,
  getTopicsByCourse,
  updateTopic,
  deleteTopic,
} = require("../controllers/courseController");

// Public
router.get("/", getCourses);
router.get("/:id", getCourseById);
router.get("/:courseId/topics", getTopicsByCourse);

// Admin-only
router.post("/", protect, adminAuth, createCourse);
router.put("/:id", protect, adminAuth, updateCourse);
router.delete("/:id", protect, adminAuth, deleteCourse);

router.post("/:courseId/topics", protect, adminAuth, createTopic);
router.put("/topics/:topicId", protect, adminAuth, updateTopic);
router.delete("/topics/:topicId", protect, adminAuth, deleteTopic);

module.exports = router;
