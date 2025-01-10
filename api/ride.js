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
const authMiddleware = require("../middleware/authentication");
const rideRouter = require("../routes/ride");
const serverlessExpress = require("@vendia/serverless-express");

const app = express();
app.use(express.json());
app.use("/ride", authMiddleware, rideRouter);

exports.handler = serverlessExpress({ app });

