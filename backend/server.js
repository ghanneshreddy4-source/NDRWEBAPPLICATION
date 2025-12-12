// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB } = require("./config/db");
const { notFound, errorHandler } = require("./utils/errorHandler");

dotenv.config();

// Connect DB (PostgreSQL + Sequelize)
connectDB();

const app = express();

// Body parser
app.use(express.json());

// CORS
const allowedOrigins = [
  process.env.CORS_ORIGIN || "http://localhost:5500",
  "http://127.0.0.1:5500",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "NDR Backend API is running 🚀" });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/tests", require("./routes/testRoutes"));
app.use("/api/queries", require("./routes/queryRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));

// 404 + error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
