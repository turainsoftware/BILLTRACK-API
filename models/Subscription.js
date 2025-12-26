const { DataTypes } = require("sequelize");
const { sequilize } = require("./../config/db");
const { Business } = require("./Business");

const Subscription = sequilize.define(
  "Subscription",
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
    plan: {
      type: DataTypes.ENUM("free", "basic", "pro"),
      allowNull: false,
      defaultValue: "free",
    },
    orderId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentSignature: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount:{
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => {
        const date = new Date();
        date.setDate(date.getDate() + 14);
        return date;
      },
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
    tableName: "Subscription",
    timestamps: true,
  }
);

Subscription.belongsTo(Business, { foreignKey: "businessId" });

module.exports = Subscription;
