const { DataTypes } = require("sequelize");
const { sequilize } = require("./../config/db");
const { Business } = require("./Business");

const Invoice = sequilize.define(
  "Invoice",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    businessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Business",
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    customerNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM("paid", "unpaid", "canceled"),
      allowNull: false,
      defaultValue: "unpaid",
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
    tableName: "Invoices",
    timestamps: true,
  }
);

Invoice.belongsTo(Business, {
  foreignKey: "businessId",
  as: "business",
});

module.exports = { Invoice };
