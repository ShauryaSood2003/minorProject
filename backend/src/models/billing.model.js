import mongoose, {Schema} from "mongoose";   

const billingSchema = new Schema(
    {
      token: {
        type: Number,
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
    { timestamps: true }
);
  
// Export Billing Model
export const Billing = mongoose.model("Billing", billingSchema);
