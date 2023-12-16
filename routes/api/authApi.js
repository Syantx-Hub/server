//(routes/api/authApi.js)
const { Router } = require("express");

const authController = require("../controller/authController");

const router = Router();

router.post("/login", (req, res, next) => {
  try {
    authController.login(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/signup", (req, res, next) => {
  try {
    authController.signup(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (req, res, next) => {
  try {
    authController.logout(req, res);
  } catch (error) {
    next(error);
  }
});

router.get("/refresh_token", (req, res, next) => {
  try {
    authController.refreshToken(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
