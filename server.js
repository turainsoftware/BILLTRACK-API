const express = require("express");

// routers imports
const BusinessCategoryRouter = require("./routers/BusinessCategoryRouter.js");
const productRouter = require("./routers/productRouter");
const HsnRouter = require("./routers/HsnRouter.js");
const ProductCategoryRouter = require("./routers/ProductCategoyRouter.js");

// Middleware Imports
const logger = require("./middleware/Logger.js");

// Import COnfig
const { PORT } = require("./config/config");
const { connectDB, sequilize } = require("./config/db");

// APP CREATION
const app = express();

// MIDDLEWARE
app.use(express.json());

// ROUTES
app.use("/api/v1/businessCategory", logger, BusinessCategoryRouter);
app.use("/api/v1/products", logger, productRouter);
app.use("/api/v1/hsn", logger, HsnRouter);
app.use("/api/v1/product-category", logger, ProductCategoryRouter);

app.get("/test", (req, res) => {
  return res.json({
    message: "hello world",
  });
});

connectDB();
sequilize
  .sync()
  .then(() => {
    app.listen(PORT, () => console.log(`server started at ${PORT}`));
  })
  .catch((err) => {
    console.error("error, ", err);
  });
