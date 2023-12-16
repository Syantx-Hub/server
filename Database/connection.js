const mongoose = require("mongoose");

module.exports = () => {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  try {
    mongoose
      .connect(process.env.DB)
      .then(() => console.log("database connection is successful"));
  } catch (error) {
    console.log(`DB connection cause error` + error);
  }
};
