// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const { sequelize, connectDB } = require("./config/db"); // ✅ ensure sequelize imported
const { notFound, errorHandler } = require("./utils/errorHandler");
const videoRoutes = require("./routes/videoRoutes");

dotenv.config();

const app = express();

// ---------------------------
// 🗄️ CONNECT DATABASE
// ---------------------------
connectDB();

// ---------------------------
// 🧩 MIDDLEWARE
// ---------------------------
app.use(express.json());

// ---------------------------
// 🌍 CORS CONFIGURATION
// ---------------------------
const allowedOrigins = [
  process.env.CORS_ORIGIN || "http://localhost:5500",
  "http://127.0.0.1:5500",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Range", "Accept-Ranges"],
  })
);

// ---------------------------
// 💚 HEALTH CHECK ROUTE
// ---------------------------
app.get("/", (req, res) => {
  res.json({ message: "✅ NDR Backend API is running 🚀" });
});

// ---------------------------
// 📦 ROUTES
// ---------------------------
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/tests", require("./routes/testRoutes"));
app.use("/api/queries", require("./routes/queryRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes")); // ✅ corrected prefix

// ✅ Register Google Drive video proxy route
app.use("/", videoRoutes);

// ---------------------------
// 🧭 SERVE FRONTEND STATIC FILES
// ---------------------------
app.use(express.static(path.join(__dirname, "..", "frontend")));

// ---------------------------
// ⚠️ ERROR HANDLERS
// ---------------------------
app.use(notFound);
app.use(errorHandler);

// ---------------------------
// 🚀 START SERVER AFTER DB SYNC
// ---------------------------
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // ✅ Synchronize all models with PostgreSQL
    await sequelize.sync({ alter: true });
    console.log("✅ Tables synchronized with PostgreSQL");

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Database sync/startup error:", err);
    process.exit(1);
  }
}

startServer();
