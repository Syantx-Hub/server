const { model } = require("mongoose");
const userSchema = require("../Schema/user");

module.exports = {
  User: model("user", userSchema),
};
