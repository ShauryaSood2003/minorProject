import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { redisClient } from "../databases/redis.js";

export const userSignup = async (req, res) => {
    // res.send("signup route called")

    // console.log("req", req) ;

    // console.log("req.body", req.body) ;

    const { name, email, password } = req.body;

    // console.log(req) ;
    // console.log(req.body) ;
    // find why the heck this is not getting anything in the req.body, find out read the pointToRemember doc point 3

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ data: {}, status: 400, message: "All fields are required" })
        }
    
        
    
        // check if email already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Email already exists", data: { _id: userExists._id, name: userExists.name, email: userExists.email}, status: 400 })
        }
    
        // create new user and add them to the database
        const newUser = await User.create({
            name,
            email,
            password
        })
    
        if (!newUser) {
            return res.status(500).json({ message: "Failed to create user", data: {}, status: 500 })
        }
    
        // console.log(newUser) ;
    
        // generate the tokens
        const { accessToken, refreshToken } = generateAuthTokens(newUser._id);
    
        storeRefreshToken(newUser._id, refreshToken).catch((err) => console.log("Error storing refresh token in redis", err))
    
        res
            .status(201)
            .json({ data: { _id: newUser._id, name: newUser.name, email: newUser.email, accessToken, refreshToken }, message: "User Registered successfully", status: 201 })
    } catch (error) {
        console.log("Error in user signup", error)
        res.status(500).json({ message: "Internal server error while signing up", data: {}, status: 500 })
    }
}

export const userLogin = async (req, res) => {
    // res.send("login route called")

    try {
        const { email, password } = req.body;
    
        if (!email || !password) {  
            return res.status(400).json({ data: {}, status: 400, message: "All fields are required" })
        }
    
        const existingUser = await User.findOne({ email })
    
        if (!existingUser) {
            return res.status(400).json({ data: {}, status: 400, message: "User does not exist" })
        }
    
        if (!(await existingUser.matchPassword(password))) {
            return res.status(400).json({ data: {}, status: 400, message: "Incorrect password" })
        }
    
        // generate the tokens
        const { accessToken, refreshToken } = generateAuthTokens(existingUser._id);
    
        storeRefreshToken(existingUser._id, refreshToken).catch((err) => console.log("Error storing refresh token in redis", err))
    
        res
            .status(200)
            .json({ data: { _id: existingUser._id, name: existingUser.name, email: existingUser.email, accessToken, refreshToken }, message: "User logged in successfully", status: 200 })
    } catch (error) {
        console.log("Error in user login", error) ;
        res.status(500).json({ data: {}, status: 500, message: "Internal server error while logging in" })
    }

}
export const userLogout = async (req, res) => {
    // res.send("logout route called")


    try {
      

        const accessToken = req.headers['authorizationToken'];
        const refreshToken = req.headers['refreshToken'];

        const access = accessToken && accessToken.split(' ')[1];
        const refresh = refreshToken && refreshToken.split(' ')[1];
     
        // if refresh token is recieved from the client side, find the user id from the refresh token

        if (!refresh && !access) {
            return res.status(200).json({ message: "User is already logged out", data: {}, status: 200 });
        }

        if (refresh) {
            const decodedInfo = jwt.verify(refresh, process.env.REFRESH_TOKEN_SECRET);

            // console.log("Decoded Info", decodedInfo);
            // {
            //     userId: '66f32b0966117bc9f03589be',
            //     iat: 1727212297,
            //     exp: 1727817097
            // }

            await redisClient.del(`refreshToken:${decodedInfo.userId}`)
                .catch((error) => {
                    console.log("Error deleting refresh token from redis while logging out the user ", error)
                })

                // res.status(200).json({ message: `User ${decodedInfo.userId} logged out successfully`, data: {}, status: 200 })
        }

      
        res.status(200).json({ message: "User logged out successfully", data: {}, status: 200 });
        // res.status(200);

    }
    catch (err) {
        console.log("Error in user logout", err)
        res.status(500).json({ message: "Internal server error while logging out", data: {}, status: 500 })
    }
}

export const refreshTheAccessToken = async (req, res) =>  {

    // steps
    // 1. take the refresh token from the request
    //2 . decode the refresh token
    //3. find the refresh token in redis and compare both of them
    // 4. if they match, generate a new access token and send it back to the user
    
    try {
        
        const refreshToken = req.headers['refreshToken'];
        const refresh = refreshToken && refreshToken.split(' ')[1];
        // console.log(refreshToken) ;

        if (!refresh) {
            return res.status(401).json({ message: "Unauthorized access, refresh token is required", data: {}, status: 401 })
        }

        const decodedInfo = jwt.verify(refresh, process.env.REFRESH_TOKEN_SECRET);
        // console.log("Decoded Info", decodedInfo);

        const userId = decodedInfo.userId;
        const refreshTokenInRedis = await redisClient.get(`refreshToken:${userId}`);

        if (!refreshTokenInRedis) {
            return res.status(401).json({ message: "Unauthorized access, refresh token not in db", data: {}, status: 401 })
        }

        if (refreshTokenInRedis !== refresh) {
            return res.status(401).json({ message: "Invalid refresh token", data: {}, status: 401 })
        }

        const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY_DURATION });

        res.status(200)
        .json({ data: { accessToken }, message: "Access token refreshed successfully", status: 200 })
    }

    catch (err) {
        console.log("Error in refreshing the access token", err)
        res.status(500).json({ message: "Internal server error while refreshing the access token", data: {}, status: 500 })
    }

}

// some utility functions and parameters


const generateAuthTokens = (userId) => {

    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY_DURATION });

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY_DURATION });

    return { accessToken, refreshToken };
}

const storeRefreshToken = async (userId, refreshToken) => {
    // store the refresh token in redis database 
    try {

        await redisClient.set(`refreshToken:${userId}`, refreshToken, "EX", 60 * 60 * 24 * 7); // store the refresh token in redis database for 7 days
    }
    catch (err) {

        throw err;
    }
}