// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const { sequelize, connectDB } = require("./config/db");
const { notFound, errorHandler } = require("./utils/errorHandler");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const courseRoutes = require("./routes/courseRoutes");
const testRoutes = require("./routes/testRoutes");
const queryRoutes = require("./routes/queryRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const videoRoutes = require("./routes/videoRoutes");

dotenv.config();

const app = express();

/* =====================================================
   🗄️ DATABASE CONNECTION
===================================================== */
connectDB();

/* =====================================================
   🧩 MIDDLEWARE
===================================================== */
app.use(express.json());

/* =====================================================
   🌍 CORS CONFIGURATION (RENDER + LOCAL)
===================================================== */
const allowedOrigins = [
  "https://ndrwebapplicationg.onrender.com",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow REST tools & same-origin calls
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/* =====================================================
   💚 HEALTH CHECK
===================================================== */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "✅ NDR Backend API is running 🚀",
  });
});

/* =====================================================
   📦 API ROUTES
===================================================== */
app.use("https://ndrwebapplication-1.onrender.com/api/auth", authRoutes);
app.use("https://ndrwebapplication-1.onrender.com/api/users", userRoutes);
app.use("https://ndrwebapplication-1.onrender.com/api/admin", adminRoutes);
app.use("https://ndrwebapplication-1.onrender.com/api/courses", courseRoutes);
app.use("https://ndrwebapplication-1.onrender.com/api/tests", testRoutes);
app.use("https://ndrwebapplication-1.onrender.com/api/queries", queryRoutes);
app.use("https://ndrwebapplication-1.onrender.com/api/announcements", announcementRoutes);
app.use("https://ndrwebapplication-1.onrender.com/api/dashboard", dashboardRoutes);

// Google Drive / Video proxy routes
app.use("/", videoRoutes);

/* =====================================================
   ⚠️ ERROR HANDLERS
===================================================== */
app.use(notFound);
app.use(errorHandler);

/* =====================================================
   🚀 START SERVER (RENDER SAFE)
===================================================== */
const PORT = process.env.PORT || 5000;

(async function startServer() {
  try {
    await sequelize.sync();
    console.log("✅ PostgreSQL tables synchronized");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
})();
