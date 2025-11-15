// models/Product.js
const { DataTypes } = require("sequelize");
const { sequilize } = require("../config/db");
const { Business } = require("./Business");
const { ProductCategory } = require("./ProductCategory");

const Product = sequilize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    businessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Business",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hsnId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Hsn",
        key: "id",
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
    },
    unitType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Product",
    timestamps: true,
  }
);

Product.belongsTo(Business, {
  foreignKey: "businessId",
  as: "business",
});

Product.belongsTo(ProductCategory, {
  foreignKey: "hsnId",
  as: "hsn",
});

module.exports = { Product };
