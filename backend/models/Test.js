// models/Test.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Test = sequelize.define(
  "Test",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    topicId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },
    // array of question objects:
    // { _id, questionText, options[{optionText}], correctOptionIndex, marks }
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
    tableName: "Tests",
    timestamps: true,
  }
);

module.exports = Test;
