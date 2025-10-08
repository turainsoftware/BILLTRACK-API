const { DataTypes } = require("sequelize");
const { sequilize } = require("./../config/db");
const { Invoice } = require("./Invoice");

const InvoiceItems = sequilize.define(
  "InvoiceItems",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    invoiceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "invoices",
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    gstType: {
      type: DataTypes.ENUM("cgst/sgst", "igst"),
    },
    gstPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
  },
  {
    tableName: "invoice_items",
    timestamps: false,
  }
);

InvoiceItems.belongsTo(Invoice, {
  foreignKey: "invoiceId",
  as: "invoice",
});

module.exports = { InvoiceItems };
