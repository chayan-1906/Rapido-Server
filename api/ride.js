/*
const express = require("express");
const {createRide, updateRideStatus, acceptRide, getMyRides} = require("../controllers/ride");

const router = express.Router();

router.use((req, res, next) => {
    req.io = req.app.get("io");
    next();
});

router.get("/rides", getMyRides);
router.post("/create", createRide);
router.patch("/accept/:rideId", acceptRide);
router.patch("/update/:rideId", updateRideStatus);

module.exports = router;
*/


const express = require("express");
const serverlessExpress = require("@vendia/serverless-express");
const rideRouter = require("../routes/ride");
const authMiddleware = require("../middleware/authentication");

const app = express();
app.use(express.json());
app.use("/ride", authMiddleware, rideRouter);

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
