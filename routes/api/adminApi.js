const { Router } = require("express");
const router = Router();

router.get("/test", function (req, res) {
  console.log("lee pal");
  res.json({ message: "test" });
});

module.exports = router;
