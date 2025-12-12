// models/Course.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Course = sequelize.define(
  "Course",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false, // Course name (e.g. ABAP, SAP)
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Course code (e.g. ABAP101)
    },
    description: {
      type: DataTypes.TEXT, // Course description
      allowNull: true,
    },
    // Optional extra resources (not required yet)
    // array of { type, label, url }
    resources: {
      // If you use MySQL, change JSONB -> JSON
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "Courses",
    timestamps: true,
  }
);

module.exports = Course;
