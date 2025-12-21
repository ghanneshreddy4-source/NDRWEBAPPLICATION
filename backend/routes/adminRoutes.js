// routes/adminRoutes.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const {
  getPendingUsers,
  approveUser,
  getAllUsers,
  getStats,
} = require("../controllers/adminController");

// GET /api/admin/pending-users
router.get("https://ndrwebapplication-1.onrender.com/pending-users", auth, adminAuth, getPendingUsers);

// PUT /api/admin/approve-user/:id
router.put("https://ndrwebapplication-1.onrender.com/approve-user/:id", auth, adminAuth, approveUser);

// GET /api/admin/users
router.get("https://ndrwebapplication-1.onrender.com/users", auth, adminAuth, getAllUsers);

// GET /api/admin/stats
router.get("https://ndrwebapplication-1.onrender.com/stats", auth, adminAuth, getStats);

module.exports = router;
