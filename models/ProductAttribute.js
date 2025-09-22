// models/ProductAttribute.js
const { DataTypes } = require("sequelize");
const { sequilize } = require("../config/db");

const ProductAttribute = sequilize.define(
  "ProductAttribute",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    data_type: { type: DataTypes.STRING, allowNull: false },
  },
  {
    timestamps: false,
    tableName: "product_attributes",
  }
);

module.exports = { ProductAttribute };