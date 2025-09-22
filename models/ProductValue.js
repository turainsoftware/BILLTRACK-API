// models/ProductValue.js
const { DataTypes } = require("sequelize");
const { sequilize } = require("../config/db");
// No need to import ProductEntity or ProductAttribute here, associations are handled in index.js

const ProductValue = sequilize.define(
  "ProductValue",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    attribute_id: { type: DataTypes.INTEGER, allowNull: false },
    value: { type: DataTypes.STRING, allowNull: true },
  },
  {
    timestamps: false,
    tableName: "product_values",
  }
);

// 🔗 Associations
// ProductValue.belongsTo(ProductEntity, { foreignKey: "product_id", as: "product" });
// ProductValue.belongsTo(ProductAttribute, { foreignKey: "attribute_id", as: "attribute" });
// ProductAttribute.hasMany(ProductValue, { foreignKey: "attribute_id", as: "values" });


module.exports = { ProductValue };