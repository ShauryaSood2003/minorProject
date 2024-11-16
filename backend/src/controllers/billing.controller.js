import { Billing } from "../models/billing.model.js";
import { User } from "../models/user.model.js";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Your Razorpay API Key
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Your Razorpay API Secret
});

export const billingAccount = async (req, res) => {
    try {
      const { userId } = req.body;
  
      // Check if userId is provided
      if (!userId) {
        return res.status(400).json({ success: false, message: "No userID found!" });
      }
  
      // Find the billing account associated with the userId
      const billingAccount = await Billing.findOne({ user: userId }).populate("user");
  
      // If no billing account found, return an error
      if (!billingAccount) {
        return res.status(404).json({ success: false, message: "Billing account not found!" });
      }
  
      // Return the billing account details
      return res.status(200).json({
        success: true,
        message: "Billing account retrieved successfully",
        data: billingAccount,
      });
    } catch (error) {
      // Handle errors and return a server error response
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching the billing account",
        error: error.message,
      });
    }
};
  
export const buyTokens = async (req, res) => {
    try {
      const { userId, tokens } = req.body;
  
      // Validate input
      if (!userId || !tokens) {
        return res.status(400).json({ success: false, message: "userId and tokens are required!" });
      }
  
      // Find the billing account for the user
      let billingAccount = await Billing.findOne({ user: userId });
  
      // If no billing account exists, create a new one
      if (!billingAccount) {
        billingAccount = new Billing({ user: userId, token: tokens });
      } else {
        // Add tokens to the existing billing account
        billingAccount.token += tokens;
      }
  
      // Save the billing account
      await billingAccount.save();
  
      // Return the updated billing account
      return res.status(200).json({
        success: true,
        message: "Tokens purchased successfully",
        data: billingAccount,
      });
    } catch (error) {
      // Handle errors
      return res.status(500).json({
        success: false,
        message: "An error occurred while purchasing tokens",
        error: error.message,
      });
    }
};


export const createOrder = async (req, res) => {
    try {
      const { amount, currency } = req.body;
  
      // Validate input
      if (!amount || !currency) {
        return res.status(400).json({ success: false, message: "Amount and currency are required!" });
      }
  
      // Create a Razorpay order
      const options = {
        amount: amount * 100, // Razorpay works with smallest currency units (e.g., paise for INR)
        currency: currency,
        receipt: `receipt_${Date.now()}`, // Unique receipt ID for tracking
      };
  
      const razorpayOrder = await razorpay.orders.create(options);


      const data = {
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderID: razorpayOrder.id,
      }
  
      // Return the created order details
      return res.status(200).json({
        success: true,
        message: "Order created successfully",
        data,
      });
    } catch (error) {
      // Handle errors
      return res.status(500).json({
        success: false,
        message: "An error occurred while creating the Razorpay order",
        error: error.message,
      });
    }
};

export const getProfile = async (req, res) => {
    try {
      const { userId } = req.body;
  
      // Validate userId
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          message: "User ID is missing!" 
        });
      }
  
      // Find user and populate references
      const user = await User.findById(userId)
        .populate("conversations")
        .populate("billing");
  
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found!" 
        });
      }
  
      // Send user data
      return res.status(200).json({
        success: true,
        message: "User profile fetched successfully",
        data: user,
      });
    } catch (error) {
      console.error("Error in fetching user profile:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error while fetching user profile",
      });
    }
  };