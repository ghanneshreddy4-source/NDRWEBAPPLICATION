// models/Result.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Result = sequelize.define(
  "Result",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // For normal tests
    testId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // For major tests
    majorTestId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    score: { type: DataTypes.INTEGER, allowNull: false },
    totalMarks: { type: DataTypes.INTEGER, allowNull: false },
    // array of { questionId, selectedOptionIndex, isCorrect, marksAwarded }
    answers: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
  },
  {
    tableName: "Results",
    timestamps: true,
  }
);

module.exports = Result;
