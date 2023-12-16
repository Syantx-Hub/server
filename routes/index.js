//(routes/index.js)
const authApi = require("./api/authApi");
const adminApi = require("./api/adminApi");
const { verifyToken } = require("../middlewares");

module.exports = function (app) {
  app.use("*", verifyToken);
  app.use("/auth", authApi);
  app.use("/admin", adminApi);
};
