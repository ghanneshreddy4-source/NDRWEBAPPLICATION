const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const { updateTopic, deleteTopic } = require("../controllers/topicController");

// ===============================
// TOPIC MANAGEMENT (Admin)
// ===============================
router.put("https://ndrwebapplication-1.onrender.com/courses/:courseId/topics/:id", updateTopic);
router.delete("https://ndrwebapplication-1.onrender.com/courses/:courseId/topics/:id", deleteTopic);

// ===============================
// COURSE ROUTES
// ===============================

// ✅ 1️⃣ — Get all courses (before dynamic routes)
router.get("https://ndrwebapplication-1.onrender.com/", courseController.getCourses);

// ✅ 2️⃣ — Get all major tests (must come BEFORE :id route)
router.get("https://ndrwebapplication-1.onrender.com/major-tests", courseController.getMajorTests);

// ✅ 3️⃣ — Get topics for a specific course (still before :id to avoid conflict)
router.get("https://ndrwebapplication-1.onrender.com/:courseId/topics", courseController.getTopicsByCourse);

// ✅ 4️⃣ — CRUD for specific course (use numeric-only route for safety)
router.get("https://ndrwebapplication-1.onrender.com/:id(\\d+)", courseController.getCourseById);
router.post("https://ndrwebapplication-1.onrender.com/", courseController.createCourse);
router.put("https://ndrwebapplication-1.onrender.com/:id(\\d+)", courseController.updateCourse);
router.delete("https://ndrwebapplication-1.onrender.com/:id(\\d+)", courseController.deleteCourse);

// ✅ 5️⃣ — Create topic for a course
router.post("https://ndrwebapplication-1.onrender.com/:courseId/topics", courseController.createTopic);

// ✅ 6️⃣ — Update / Delete topic (redundant but kept for consistency)
router.put("https://ndrwebapplication-1.onrender.com/:courseId/topics/:topicId", courseController.updateTopic);
router.delete("https://ndrwebapplication-1.onrender.com/:courseId/topics/:topicId", courseController.deleteTopic);

module.exports = router;
