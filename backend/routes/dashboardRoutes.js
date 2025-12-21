const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const auth = require("../middleware/auth");

router.get("https://ndrwebapplication-1.onrender.com/stats", auth, dashboardController.getStudentDashboardStats);

module.exports = router;

