// routes/announcementRoutes.js
const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

const {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");

// Student & Admin can view
router.get("/", getAnnouncements);

// Admin only
router.post("/", protect, adminAuth, createAnnouncement);
router.put("/:id", protect, adminAuth, updateAnnouncement);
router.delete("/:id", protect, adminAuth, deleteAnnouncement);

module.exports = router;
