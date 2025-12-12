// routes/queryRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const {
  createQuery,
  getMyQueries,
  getAllQueries,
  replyQuery,
} = require("../controllers/queryController");

// Student
router.post("/", protect, createQuery);
router.get("/my", protect, getMyQueries);

// Admin
router.get("/", protect, adminAuth, getAllQueries);
router.put("/:id/reply", protect, adminAuth, replyQuery);

module.exports = router;
