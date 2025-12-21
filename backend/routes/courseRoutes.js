const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const { updateTopic, deleteTopic } = require("../controllers/topicController");

// ===============================
// TOPIC MANAGEMENT (Admin)
// ===============================
router.put("/courses/:courseId/topics/:id", updateTopic);
router.delete("/courses/:courseId/topics/:id", deleteTopic);

// ===============================
// COURSE ROUTES
// ===============================

// ✅ 1️⃣ — Get all courses (before dynamic routes)
router.get("/", courseController.getCourses);

// ✅ 2️⃣ — Get all major tests (must come BEFORE :id route)
router.get("/major-tests", courseController.getMajorTests);

// ✅ 3️⃣ — Get topics for a specific course (still before :id to avoid conflict)
router.get("/:courseId/topics", courseController.getTopicsByCourse);

// ✅ 4️⃣ — CRUD for specific course (use numeric-only route for safety)
router.get("/:id(\\d+)", courseController.getCourseById);
router.post("/", courseController.createCourse);
router.put("/:id(\\d+)", courseController.updateCourse);
router.delete("/:id(\\d+)", courseController.deleteCourse);

// ✅ 5️⃣ — Create topic for a course
router.post("/:courseId/topics", courseController.createTopic);

// ✅ 6️⃣ — Update / Delete topic (redundant but kept for consistency)
router.put("/:courseId/topics/:topicId", courseController.updateTopic);
router.delete("/:courseId/topics/:topicId", courseController.deleteTopic);

module.exports = router;
