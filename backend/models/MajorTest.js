// models/MajorTest.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const MajorTest = sequelize.define(
  "MajorTest",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false, // e.g. "Week 1 Test"
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 60,
    },
    // array of question objects (same style as Test)
    questions: {
      // If MySQL, use DataTypes.JSON
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "MajorTests",
    timestamps: true,
  }
);

module.exports = MajorTest;
