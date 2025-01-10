const express = require("express");
const router = express.Router();
const { refreshToken, login } = require("../controllers/auth");

router.post("/login", login);
router.post("/refresh-token", refreshToken);

module.exports = router;
