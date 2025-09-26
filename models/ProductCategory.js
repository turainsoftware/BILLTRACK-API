const { DataTypes } = require("sequelize");
const { sequilize } = require("./../config/db");
const { Hsn } = require("./Hsn");
const { BusinessCategory } = require("./BusinessCategory");

const ProductCategory = sequilize.define(
  "ProductCategory",
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
    hsnId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    businessCategory: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: "ProductCategory",
    timestamps: true,
  }
);

ProductCategory.belongsTo(Hsn, {
  foreignKey: "hsnId",
});

ProductCategory.belongsTo(BusinessCategory, {
  foreignKey: "businessCategory",
});

module.exports = {
  ProductCategory,
};
