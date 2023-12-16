//(routes/controller/authController.js)
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const { User } = require("../../Database/Model/index");
var jwt = require("jsonwebtoken");

//
let refreshTokens = [];

// const time = 5 * 300000; //
const time = 20 * 1000;
//error message
const handleErrorMessage = (err) => {
  // console.log("Error code : ", err.code);
  const errors = { email: "", password: "", name: "", role: "" };
  //validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

//generate jwt token
const generateJwtToken = (id) => {
  const token = jwt.sign({ id }, process.env.Access_Token, {
    expiresIn: "10s",
  });
  return token;
};

//generate refresh toekn
const generateRefreshToken = (id) => {
  const token = jwt.sign({ id }, process.env.REFRESH_TOKEN);
  return token;
};

const login = async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await User.findOne({ name });

    if (user) {
      const isPasswordValid = await user.comparePassword(password);

      if (isPasswordValid) {
        // Successful login
        const returnUser = {
          name: user.name,
          role: user.role,
        };
        const token = generateJwtToken(user._id);

        const refreshToken = generateRefreshToken(user._id);
        refreshTokens.push(refreshToken);

        res.cookie("jwt", token, { httpOnly: true });

        res.cookie("refreshToken", refreshToken, { httpOnly: true });
        res.cookie("isValid", true, { httpOnly: false, maxAge: time });
        res.status(200).json({
          success: true,
          message: "Login successful",
          user: returnUser,
        });
      } else {
        res.status(401).json({ success: false, message: "Invalid password" });
      }
    } else {
      res.status(401).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const signup = async (req, res) => {
  try {
    const { name, password, email, role } = req.body;

    const existingUser = await User.findOne({ name });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: {
          email: "",
          password: "",
          name: "User name already exists",
          role: "",
        },
      });
    }

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: {
          email: "User email already exists",
          password: "",
          name: "",
          role: "",
        },
      });
    }

    const user = await User.create({ name, password, email, role });
    const token = generateJwtToken(user._id);

    res.cookie("jwt", token, { httpOnly: true, maxAge: time });
    res.cookie("isValid", true, { httpOnly: false, maxAge: time });

    const returnUser = {
      name: user.name,
      role: user.role,
    };
    return res.status(201).json({
      success: true,
      message: "User creation successful",
      user: returnUser,
    });
  } catch (err) {
    const errors = handleErrorMessage(err);
    res.status(500).json({ success: false, message: errors });
  }
};

const logout = async (req, res) => {};

const refreshToken = async (req, res) => {
  console.log("refresh token function");
  const { refreshToken: refToken } = req.cookies;

  if (!refToken) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Missing Refresh Token",
    });
  }
  try {
    console.log("refresh token contain in header : ", refToken);
    jwt.verify(refToken, process.env.REFRESH_TOKEN, async (err, decode) => {
      if (err)
        return res.status(401).json({
          success: false,
          message: "Invalid Refresh Token",
          err: err,
        });
      //successful verify
      console.log("refresh token verify successful");
      if (!refreshTokens.includes(refToken)) {
        console.log("refresh token history verify failed");
        return res.status(401).json({
          success: false,
          message: "Your refresh token is invalid",
        });
      }
      console.log("refresh token history verify successful");
      refreshTokens = refreshTokens.filter((token) => token !== refToken);
      const user = await User.findById(decode.id);

      //remaking token
      const token = generateJwtToken(user._id);
      const NewrefreshToken = generateRefreshToken(user._id);
      refreshTokens.push(NewrefreshToken);

      //sending cookie
      res.cookie("jwt", token, { httpOnly: true });
      res.cookie("refreshToken", NewrefreshToken, { httpOnly: true });
      res.cookie("isValid", true, { httpOnly: false, maxAge: time });

      return res.status(200).json({
        success: true,
        message: "Token refresh process successful",
      });
    });
  } catch (error) {}
};

module.exports = {
  login,
  signup,
  logout,
  refreshToken,
};
