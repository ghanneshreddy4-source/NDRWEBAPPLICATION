// models/Query.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Query = sequelize.define(
  "Query",
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
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    adminReply: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM("open", "answered", "closed"),
      defaultValue: "open",
    },
  },
  {
    tableName: "Queries",
    timestamps: true,
  }
);

module.exports = Query;
