// backend/config/db.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

// Initialize Sequelize using DATABASE_URL (for hosted DBs like Render, Railway, etc.)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

// Function to connect and sync all models
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected successfully");

    // Load all models (index.js in models folder)
    require("../models");

    // Sync tables with database
    await sequelize.sync();
    console.log("Tables synchronized with PostgreSQL");
  } catch (err) {
    console.error("PostgreSQL connection error:", err);
    process.exit(1);
  }
};

// ✅ Export both the instance and the connect function
// This ensures model files can safely do:
// const sequelize = require("../config/db"); OR const { sequelize } = require("../config/db");
module.exports = sequelize;
module.exports.sequelize = sequelize;
module.exports.connectDB = connectDB;
