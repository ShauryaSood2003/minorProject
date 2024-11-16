import { Billing } from "../models/billing.model.js";
import jwt from "jsonwebtoken";
import { redisClient } from "../databases/redis.js";

export const billingAccount = async (req, res) => {
    try {
        const { userId } = req.body;
        if(!userId){
            throw new Error("No userID found!")
        }
        const existingUser = await User.findOne({ id:userId });
        
    } catch (error) {
        
    }
}