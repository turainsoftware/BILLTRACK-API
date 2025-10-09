const express = require("express");

const BusinessCategoryRouter = require("./routers/BusinessCategoryRouter.js");
const ProductRouter = require("./routers/productRouter");
const HsnRouter = require("./routers/HsnRouter.js");
const ProductCategoryRouter = require("./routers/ProductCategoyRouter.js");
const InvoiceRouter = require("./routers/InvoiceRouter.js");
const UserRouter = require("./routers/UserRouter.js");
const BusinessRouter = require("./routers/BusinessRoute.js");

const logger = require("./middleware/Logger.js");

const { specs, swaggerUi } = require("./config/swagger.config.js");

// Import COnfig
const { PORT, LOGO_DIR } = require("./config/config");
const { connectDB, sequilize } = require("./config/db");

const app = express();

app.use(express.json());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "HSN API Documentation",
  })
);

// ROUTES
app.use("/api/v1/businessCategory", logger, BusinessCategoryRouter);
// app.use("/api/v1/products", logger, ProductRouter);
app.use("/api/v1/hsn", logger, HsnRouter);
app.use("/api/v1/product-category", logger, ProductCategoryRouter);
app.use("/api/v1/invoice", logger, InvoiceRouter);
app.use("/api/v1/user", logger, UserRouter);
app.use("/api/v1/business", logger, BusinessRouter);

// file routes
app.use("/api/v1/files/logo", express.static(LOGO_DIR));

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
