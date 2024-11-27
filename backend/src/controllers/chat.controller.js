import { Conversation } from "../models/conversation.model.js";
import { User } from "../models/user.model.js";
import { Billing } from "../models/billing.model.js";
import { aiModel } from "../utils/aiModel.js";

export const getAllConversation = async (req, res) => {
    try {
        const { userId } = req.body; // Assuming userId is sent in the request body
        if (!userId) {
            return res.status(400).json({ 
                data: {}, 
                status: 400, 
                message: "User ID is required" 
            });
        }

        // Fetch the user from the database
        const user = await User.findById(userId).populate('conversations'); // Adjust based on your schema

        if (!user) {
            return res.status(404).json({
                data: {},
                status: 404,
                message: "User not found"
            });
        }

      
        

        res.status(200).json({ 
            data: { conversations: user.conversations }, 
            message: "Conversations fetched successfully", 
            status: 200 
        });

    } catch (error) {
        console.error("Error fetching all conversations", error);
        res.status(500).json({ 
            data: {}, 
            status: 500, 
            message: "Error fetching conversations" 
        });
    }
};


export const getParticulartConversation = async (req, res) => {
    try {
        const { websiteName } = req.body;

        if (!websiteName) {
            return res.status(400).json({ data: {}, status: 400, message: "Website name is required" })
        }

        const conversations = req.user.conversations;

        const conversation = conversations.find(conv => conv.websiteName === websiteName);

        if (!conversation) {
            return res.status(400).json({ data: {}, status: 400, message: "Particular Conversation not found" })
        }

        res.status(200).json({ data: { conversation }, message: "Conversation fetched successfully", status: 200 });

    } catch (error) {
        console.error("Error fetching all conversations", error);
        res.status(400).json({ data: {}, status: 400, message: "Error fetching conversations" });
    }
}

// there is no need for this, as if the conversation does not exist, we will create it in addChat function only
export const addNewConversation = async (req, res) => {
    try {
        const { websiteName } = req.body;

        if (!websiteName) {
            return res.status(400).json({ data: {}, status: 400, message: "Website name is required" })
        }

        const addNewConversation = await Conversation.create({ websiteName });

        if (!addNewConversation) {
            return res.status(400).json({ data: {}, status: 400, message: "Error adding new conversation" })
        }

        const updatedUserWithNewConversation = await User.findOneAndUpdate({ _id: req.user._id }, { $push: { conversations: addNewConversation._id } }, { new: true }).populate({
            path: "conversations",
        }).select("-password").exec();

        if (!updatedUserWithNewConversation) {
            return res.status(400).json({ data: {}, status: 400, message: "Error adding new conversation" })
        }

        res.status(200).json({ data: { updatedUserWithNewConversation }, message: "Conversation added successfully", status: 200 });

    } catch (error) {
        console.error("Error adding new conversation", error);
        res.status(400).json({ data: {}, status: 400, message: "Error adding new conversation" });
    }
}

export const addNewChatsToConversation = async (req, res) => {
    try {
        const { websiteName, question, model, extraInfo = "" } = req.body; // question, answer, timestamp, model   

      
        if (!websiteName || !question ) {
            return res.status(400).json({ data: {}, status: 400, message: "Website name, question are required; only model is optional." });
        }

        let answer = await aiModel.generateContent(question+extraInfo)  ;
        console.log("answer", JSON.stringify(answer)) ;
        console.log("answer type", typeof answer) ;
        answer = answer.response.candidates[0].content.parts[0].text
        // const answer = "this is the answer generated by AI";

        const timestamp = new Date();

        // Find the user's conversation with the specified websiteName
        const existingUser = req.user;

        const userBilling = await Billing.findOne({ user: existingUser._id });

        if (!userBilling) {
            return res.status(400).json({ data: {}, status: 400, message: "Billing information not found for this user." });
        }

        // Check if the user has at least 5 tokens
        if (userBilling.token < 5) {
            return res.status(400).json({ data: {}, status: 400, message: "Not enough tokens. You need at least 5 tokens to perform this action." });
        }

        // Deduct 5 tokens from the user's billing
        userBilling.token -= 5;
        await userBilling.save();
        
        

        // Find the conversation by websiteName among the user's conversations
        let conversation = existingUser.conversations.find(conv => conv.websiteName === websiteName);

        

        if (!conversation) {
            const addNewConversation = await Conversation.create(
                {
                    websiteName,
                    chats: [
                        { question, answer, timestamp, model }
                    ]
                });

            if (!addNewConversation) {
                return res.status(400).json({ data: {}, status: 400, message: "While adding chat, we were making new conversation but some error occured" })
            }

            const updatedUserWithNewConversation = await User.findOneAndUpdate({ _id: existingUser._id }, { $push: { conversations: addNewConversation._id } }, { new: true }).populate({
                path: "conversations",
            }).select("-password").exec();

            if (!updatedUserWithNewConversation) {
                return res.status(400).json({ data: {}, status: 400, message: "Error adding new conversation" })
            }

            const ansObj = addNewConversation ;
            console.log("new conversation created", JSON.stringify(ansObj)) ;

            ansObj.chats = ansObj.chats?.filter(chat => chat.timestamp.getTime() === timestamp.getTime())

          

            return res.status(200).json({ data: { conversation: ansObj }, message: "Conversation added successfully", status: 200 });


        }

        // Add the new chat directly to the Conversation model
        const updatedConversation = await Conversation.findByIdAndUpdate(
            conversation._id,
            { $push: { chats: { question, answer, timestamp, model } } },
            { new: true }
        );

        if (!updatedConversation) {
            return res.status(400).json({ data: {}, status: 400, message: "Error adding new chat to the conversation." });
        }
        
        const ansObj = updatedConversation
        console.log(JSON.stringify(ansObj)) ;
        
        ansObj.chats = ansObj.chats.filter(chat => chat.timestamp.getTime() === timestamp.getTime())
        

        res.status(200).json({ data: { conversation: ansObj }, message: "Conversation updated successfully", status: 200 });

    } catch (error) {
        console.error("Error adding new chat to conversation", error);
        res.status(500).json({ data: {}, status: 500, message: "Server error adding new chat to conversation" });
    }
};

