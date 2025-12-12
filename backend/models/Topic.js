// models/Topic.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Topic = sequelize.define(
  "Topic",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false, // which course this topic belongs to
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false, // Topic title
    },
    description: {
      type: DataTypes.TEXT, // Topic summary
      allowNull: true,
    },
    order: {
      type: DataTypes.INTEGER, // For sorting (1, 2, 3, ...)
      allowNull: true,
    },
    // array of { type, label, url } – used for main link/video
    resources: {
      // If MySQL, use DataTypes.JSON
      type: DataTypes.JSONB,
      defaultValue: [],
    },
  },
  {
    tableName: "Topics",
    timestamps: true,
  }
);

module.exports = Topic;
