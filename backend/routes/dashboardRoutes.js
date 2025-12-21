const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const auth = require("../middleware/auth");

router.get("/stats", auth, dashboardController.getStudentDashboardStats);

module.exports = router;
