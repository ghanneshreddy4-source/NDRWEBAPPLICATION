// backend/models/Topic.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Topic = sequelize.define("Topic", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  order: {
    type: DataTypes.INTEGER,
  },
  primaryVideoUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  resources: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Topic;
