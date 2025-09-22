// models/ProductEntity.js
const { DataTypes } = require("sequelize");
const { sequilize } = require("../config/db");
// No need to import BusinessCategory here, associations are handled in index.js

const ProductEntity = sequilize.define(
  "ProductEntity",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    timestamps: true,
    tableName: "product_entities",
  }
);

// 🔗 Associations (These will be handled in models/index.js for consistency)
// ProductEntity.belongsTo(BusinessCategory, { foreignKey: "product_category_id", as: "category", });
// BusinessCategory.hasMany(ProductEntity, { foreignKey: "product_category_id", as: "products", });

module.exports = { ProductEntity };