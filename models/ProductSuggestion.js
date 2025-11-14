const { DataTypes } = require("sequelize");
const { sequilize } = require("../config/db");
const { ProductCategory } = require("./ProductCategory");
const { Hsn } = require("./Hsn");

const ProductSuggesion = sequilize.define(
  "ProductSuggestion",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "ProductCategory",
        key: "id",
      },
    },
    hsnId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Hsn",
        key: "id",
      },
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    unitType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { timestamps: true, tableName: "ProductSuggestion" }
);

ProductSuggesion.belongsTo(ProductCategory, {
  foreignKey: "productCategoryId",
  as: "productCategory",
});

ProductSuggesion.belongsTo(Hsn, {
  foreignKey: "hsnId",
  as: "hsn",
});

module.exports = { ProductSuggesion };
