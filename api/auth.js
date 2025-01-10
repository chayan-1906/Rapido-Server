/*const express = require("express");
const router = express.Router();
const {refreshToken, login} = require("../controllers/auth");

router.post("/login", login);
router.post("/refresh-token", refreshToken);

module.exports = router;*/


const express = require("express");
const authRouter = require("../routes/auth");
const serverlessExpress = require("@vendia/serverless-express");

const app = express();
app.use(express.json());
app.use("/auth", authRouter);

exports.handler = serverlessExpress({ app });
