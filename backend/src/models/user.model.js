import mongoose, {Schema} from "mongoose";
import bcrypt from "bcryptjs"   

const userSchema = new Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true, 
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    bio :{ 
        type:String,
    },
    conversations : [
        {
            type: Schema.Types.ObjectId,
            ref: "Conversation"
        }
    ],
    billing : {
        type:Schema.Types.ObjectId,
        ref:"Billing"
    },
    refreshToken: {
        type: String
    }
}, {timestamps: true})

// match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password) ;
}




// hash the password before saving

userSchema.pre("save", async function(next) {

    if(!this.isModified("password")) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10) ;
        this.password = await bcrypt.hash(this.password, salt) ;
        next();
    } catch (error) {
        next(error) ;
    }
})





export const User = mongoose.model("User", userSchema) ; // this should be at the end as if it is not then it will not work like pre method will not work and the methods will not work
