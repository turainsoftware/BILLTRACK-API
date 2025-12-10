const { DataTypes } = require("sequelize");
const { sequilize } = require("../config/db");
const { Business } = require("./Business");

const User = sequilize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    businessId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Business",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "0000",
    },
    role: {
      type: DataTypes.ENUM("ADMIN", "EMPLOYEE", "SUPERADMIN","USER"),
      allowNull: false,
      defaultValue: "EMPLOYEE", 
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    otpExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "User",
    timestamps: true,
  }
);

User.belongsTo(Business, {
  foreignKey: "businessId",
  as: "businesses",
});

module.exports = { User };
