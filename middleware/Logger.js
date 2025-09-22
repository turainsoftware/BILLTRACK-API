const logger = (req, res, next) => {
  console.info(`[${req.method}] { ${req.originalUrl} } : [${new Date().toUTCString()}]`);
  next();
};

module.exports = logger;
