const User = require('../models/User');
const {StatusCodes} = require('http-status-codes');
const {BadRequestError, UnauthenticatedError} = require('../errors');
const jwt = require('jsonwebtoken');

/* SAMPLE RESPONSE
{
    "message": "User created successfully",
    "user": {
        "role": "customer",
        "phone": "+911234567890",
        "_id": "6780e46b85f1fc4217602e87",
        "createdAt": "2025-01-10T09:12:11.425Z",
        "updatedAt": "2025-01-10T09:12:11.425Z",
        "__v": 0
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODBlNDZiODVmMWZjNDIxNzYwMmU4NyIsInBob25lIjoiKzkxMTIzNDU2Nzg5MCIsImlhdCI6MTczNjUwMDMzMSwiZXhwIjoxNzM2ODQ1OTMxfQ.U2khyz5uUnZdiCKmHBYlSlGBGWUVwo0lM6Yo3w1hXx4",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODBlNDZiODVmMWZjNDIxNzYwMmU4NyIsInBob25lIjoiKzkxMTIzNDU2Nzg5MCIsImlhdCI6MTczNjUwMDMzMSwiZXhwIjoxNzM5MDkyMzMxfQ.5JsjJ-p6d_RwjZs2aVQIY2aFiTtfiuPwXZXAz03T93c"
}

{
    "message": "User logged in successfully",
    "user": {
        "_id": "6780e46b85f1fc4217602e87",
        "role": "customer",
        "phone": "+911234567890",
        "createdAt": "2025-01-10T09:12:11.425Z",
        "updatedAt": "2025-01-10T09:12:11.425Z",
        "__v": 0
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODBlNDZiODVmMWZjNDIxNzYwMmU4NyIsInBob25lIjoiKzkxMTIzNDU2Nzg5MCIsImlhdCI6MTczNjUwMDY5NSwiZXhwIjoxNzM2ODQ2Mjk1fQ.4h9RidPDDlwe9P1TWaEZEOIb4qFnqvnSpyBBPU-CTzI",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODBlNDZiODVmMWZjNDIxNzYwMmU4NyIsInBob25lIjoiKzkxMTIzNDU2Nzg5MCIsImlhdCI6MTczNjUwMDY5NSwiZXhwIjoxNzM5MDkyNjk1fQ.UJ7aG5PREtjjKlzlNDQEzDipAH7hMA2ous5o7PbS9Ok"
}
*/
const login = async (req, res) => {
    const {phone, role} = req.body;

    if (!phone) {
        throw new BadRequestError('Phone number is required');
    }

    if (!role || !['customer', 'captain'].includes(role)) {
        throw new BadRequestError('Invalid role');
    }

    try {
        let user = await User.findOne({phone});

        if (user) {
            if (user.role !== role) {
                throw new BadRequestError('Phone number and role do not match');
            }

            const accessToken = user.createAccessToken();
            const refreshToken = user.createRefreshToken();

            return res.status(StatusCodes.OK).json({
                message: 'User logged in successfully',
                user,
                access_token: accessToken,
                refresh_token: refreshToken,
            });
        }

        user = new User({phone, role});

        await user.save();

        const accessToken = user.createAccessToken();
        const refreshToken = user.createRefreshToken();

        res.status(StatusCodes.CREATED).json({
            message: 'User created successfully',
            user,
            access_token: accessToken,
            refresh_token: refreshToken,
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/* SAMPLE RESPONSE
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODBlNDZiODVmMWZjNDIxNzYwMmU4NyIsInBob25lIjoiKzkxMTIzNDU2Nzg5MCIsImlhdCI6MTczNjUwMDg2OCwiZXhwIjoxNzM2ODQ2NDY4fQ.IFVBm4Rw46PRKAFrvPsdOeIqanurHBmafdq654h3dJE",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODBlNDZiODVmMWZjNDIxNzYwMmU4NyIsInBob25lIjoiKzkxMTIzNDU2Nzg5MCIsImlhdCI6MTczNjUwMDg2OCwiZXhwIjoxNzM5MDkyODY4fQ.-pvuUcRVwPMejYg1B86_VbFJ-G_VKu71komzz-f_y_M"
}
*/
const refreshToken = async (req, res) => {
    const {refresh_token} = req.body;
    if (!refresh_token) {
        throw new BadRequestError('Refresh token is required');
    }

    try {
        const payload = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(payload.id);

        if (!user) {
            throw new UnauthenticatedError('Invalid refresh token');
        }

        const newAccessToken = user.createAccessToken();
        const newRefreshToken = user.createRefreshToken();

        res.status(StatusCodes.OK).json({
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
        });
    } catch (error) {
        console.error(error);
        throw new UnauthenticatedError('Invalid refresh token');
    }
}

module.exports = {refreshToken, login}
