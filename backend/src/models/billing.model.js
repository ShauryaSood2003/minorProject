import mongoose, {Schema} from "mongoose";   

const billingSchema = new Schema({
    token:{
        type:Number
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})

export const Billing = mongoose.model("Billing", billingSchema) ; // this should be at the end as if it is not then it will not work like pre method will not work and the methods will not work
