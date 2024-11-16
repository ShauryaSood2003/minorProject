import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";


export const authenticate = async (req, res, next) => {
    try {

        const authHeader = req.headers['authorization'];
        const accessToken = authHeader && authHeader.split(' ')[1];

        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized access, access token is required", data: {}, status: 401 });
        }

        const decodedInfo = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        if (!decodedInfo) {
            return res.status(401).json({ message: "Unauthorized access, either access token is invalid or expired", data: {}, status: 401 });
        }
        
        const userInfo = await User.findOne({ _id: decodedInfo.userId }).populate({
            path: "conversations" ,
        }).exec();
        // console.log("userInfo in auth middleware with populate", userInfo);


        if (!userInfo) {
            return res.status(401).json({ message: "User could be authenticated in the middleware, please try again", data: {}, status: 401 });
        }

        req.user = userInfo;

        next();

    } catch (error) {
        console.log(error);

        return res.status(401).json({ message: "Could not authenticate the user in the auth middleware due to some error", data: {}, status: 401 });

    }
}
