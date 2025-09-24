// models/index.js
const { ProductEntity } = require("./ProductEntity");
const { BusinessCategory } = require("./BusinessCategory");
const { ProductValue } = require("./ProductValue");
const { ProductAttribute } = require("./ProductAttribute");

// Associations

// BusinessCategory <-> ProductEntity
ProductEntity.belongsTo(BusinessCategory, { foreignKey: "product_category_id", as: "productCategory" });
BusinessCategory.hasMany(ProductEntity, { foreignKey: "product_category_id", as: "categoryProducts" }); // Alias for Products belonging to a category

// ProductEntity <-> ProductValue
ProductEntity.hasMany(ProductValue, { foreignKey: "product_id", as: "entityValues" }); // Product has many values (e.g., brand, weight)
ProductValue.belongsTo(ProductEntity, { foreignKey: "product_id", as: "product" }); // A value belongs to one product

// ProductAttribute <-> ProductValue
ProductValue.belongsTo(ProductAttribute, { foreignKey: "attribute_id", as: "attribute" }); // A value has one attribute (e.g., 'Brand', 'Weight')
ProductAttribute.hasMany(ProductValue, { foreignKey: "attribute_id", as: "attributeValues" }); // An attribute can have many values across products


module.exports = {
  ProductEntity,
  BusinessCategory,
  ProductValue,
  ProductAttribute,
};