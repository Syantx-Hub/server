const jwt = require("jsonwebtoken");
const { User } = require("../Database/Model");
const moment = require("moment");

const publicRoutes = ["/auth/login", "/auth/register", "/auth/refresh_token"];

const verifyToken = async (req, res, next) => {
  try {
    // Check if the route is public
    if (publicRoutes.includes(req.baseUrl)) {
      console.log(req.baseUrl);
      return next();
    }

    // Extract JWT from cookies
    const { jwt: jwtToken } = req.cookies;

    if (!jwtToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing JWT",
      });
    }

    // Verify JWT token
    jwt.verify(jwtToken, process.env.Access_Token, async (err, decode) => {
      if (err)
        return res.status(401).json({
          success: false,
          message: "Expired jwt",
        });

      // Find user in the database
      const user = await User.findById(decode.id);

      // Check user role
      if (user && user.role === "admin") {
        return next();
      }
      // User is not admin
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not an admin",
      });
    });
  } catch (error) {
    // JWT verification failed
    console.error("JWT Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  verifyToken,
};
