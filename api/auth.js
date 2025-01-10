/*const express = require("express");
const router = express.Router();
const {refreshToken, login} = require("../controllers/auth");

router.post("/login", login);
router.post("/refresh-token", refreshToken);

module.exports = router;*/


const express = require("express");
const serverlessExpress = require("@vendia/serverless-express");
const authRouter = require("../routes/auth");

const app = express();
app.use(express.json());
app.use("/auth", authRouter);

// Handle local development vs serverless
if (process.env.NODE_ENV === "development") {
    // Local development mode
    const port = 3000;
    app.listen(port, () => {
        console.log(`Server is running locally on http://localhost:${port}/api/auth`);
    });
} else {
    // Serverless mode (Vercel or AWS Lambda)
    module.exports = serverlessExpress({ app });
}
