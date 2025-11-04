const { DataTypes } = require("sequelize");
const { sequilize } = require("../config/db");
const { BusinessCategory } = require("./BusinessCategory");

const Business = sequilize.define(
  "Business",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gstNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pinCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true },
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    businessCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "businessCategory",
        key: "id",
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "business",
    timestamps: true,
    freezeTableName: true,
  }
);

Business.belongsTo(BusinessCategory, {
  foreignKey: "businessCategoryId",
  as: "category",
});

module.exports = { Business };
