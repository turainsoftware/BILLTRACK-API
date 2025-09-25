const { DataTypes } = require("sequelize");
const { sequilize } = require("./../config/db");

const Hsn = sequilize.define(
  "Hsn",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      get() {
        return this.getDataValue("id");
      },
    },
    hsnCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      get() {
        return this.getDataValue("hsnCode");
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      get() {
        return this.getDataValue("description");
      },
    },
    cGst: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0,
      get() {
        return this.getDataValue("cGst");
      },
    },
    sGst: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0,
      get() {
        return this.getDataValue("sGst");
      },
    },
    iGst: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0,
      get() {
        return this.getDataValue("iGst");
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      get() {
        return this.getDataValue("isActive");
      },
    },
  },
  {
    timestamps: false,
    tableName: "hsn",
  }
);

module.exports = { Hsn };
