//server.js
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connection = require("./Database/connection");
const api = require("./routes");
var cookieParser = require("cookie-parser");

// essential middleware

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // enable set cookie
  })
);
app.use(express.json());
app.use(cookieParser());
//

//database connection
connection();

const port = process.env.PORT || 7000;
app.listen(port, () => {
  console.log("server is running at " + port);
});

//api
api(app);
