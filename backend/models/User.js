// backend/models/User.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) {
        if (typeof value === "string") {
          this.setDataValue("email", value.toLowerCase().trim());
        } else {
          this.setDataValue("email", value);
        }
      },
    },
    // keep password for backward compatibility but allow null
    password: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.ENUM("student", "admin"), defaultValue: "student" },
    isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },

    // OTP fields
    otp: { type: DataTypes.STRING, allowNull: true },
    otpExpires: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "Users",
    timestamps: true,
  }
);

// Hash password when present
User.beforeCreate(async (user) => {
  if (user.password && !user.password.startsWith("$2")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed("password") && user.password && !user.password.startsWith("$2")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Compare password (keeps for compatibility but not used by OTP flow)
User.prototype.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
