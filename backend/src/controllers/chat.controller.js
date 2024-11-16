import { Conversation } from "../models/conversation.model.js";
import { User } from "../models/user.model.js";
import { aiModel } from "../utils/aiModel.js";

export const getAllConversation = async (req, res) => {



    try {
        const user = req.user;

        res.status(200).json({ data: { conversations: user.conversations }, message: "Conversations fetched successfully", status: 200 });

    } catch (error) {
        console.error("Error fetching all conversations", error);
        res.status(400).json({ data: {}, status: 400, message: "Error fetching conversations" });
    }
}

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
        const { websiteName, question, model } = req.body; // question, answer, timestamp, model   

        console.log("req.body", req.body) ;

        if (!websiteName || !question ) {
            return res.status(400).json({ data: {}, status: 400, message: "Website name, question are required; only model is optional." });
        }

        let answer = await aiModel.generateContent(question)  ;
        console.log("answer", JSON.stringify(answer)) ;
        console.log("answer type", typeof answer) ;
        answer = answer.response.candidates[0].content.parts[0].text
        // const answer = "this is the answer generated by AI";


        const timestamp = new Date();

        // Find the user's conversation with the specified websiteName
        const existingUser = req.user;

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

            const ansObj = updatedUserWithNewConversation
            ansObj.chats = ansObj.chats.filter(chat => chat.timestamp.getTime() === timestamp.getTime())

            console.log("ansObj", JSON.stringify(ansObj, null, 2));

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
        console.log("updatedConversation", updatedConversation)
        const ansObj = updatedConversation
            ansObj.chats = ansObj.chats.filter(chat => chat.timestamp.getTime() === timestamp.getTime())

            console.log("ansObj", JSON.stringify(ansObj, null, 2));


        res.status(200).json({ data: { conversation: ansObj }, message: "Conversation updated successfully", status: 200 });

    } catch (error) {
        console.error("Error adding new chat to conversation", error);
        res.status(500).json({ data: {}, status: 500, message: "Server error adding new chat to conversation" });
    }
};

