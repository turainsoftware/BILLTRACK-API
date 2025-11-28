const { DataTypes } = require("sequelize");
const { sequilize } = require("../config/db");
const { Business } = require("./Business");

const Device = sequilize.define("Device", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  fcmToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  deviceType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  deviceModel: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  deviceName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  deviceUniqueKey: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  businessId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Business",
      key: "id",
    },
  },
});

Device.belongsTo(Business, {
  foreignKey: "businessId",
  as: "business",
});

module.exports = { Device };
