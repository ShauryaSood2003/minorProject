import mongoose, {Schema} from "mongoose";

const conversationSchema = new Schema({
    websiteName: {
        type: String,
        required: [true, "Name is required"]
    },
    chats : [
        {
            question: {
                type: String,
                required: [true, "Question is required"]
            },
            answer: {
                type: String,
                required: [true, "Answer is required"]
            },
            timestamp: {
                type: Date,
                required: [true, "Timestamp is required"]
            },
            model: {
                type: String,
                default: "AI Model"
            }
        }
    ]
}, {timestamps: true})



export const Conversation = mongoose.model("Conversation", conversationSchema) ; 