const { Sequelize } = require("sequelize");
const {
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_DIALECT,
} = require("./config");

const sequilize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_DIALECT,
});

const connectDB = async () => {
  try {
    await sequilize.authenticate();
    console.info("Connection has been established successfully.");
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  sequilize,
  connectDB,
};
