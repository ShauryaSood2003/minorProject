import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config() ;

export async function  connectDB() {
    try {
        // console.log("process.env.DATABASE_URI", process.env.DATABASE_URI)
        return await mongoose.connect(`${process.env.DATABASE_URI}/${process.env.DATABASE_NAME}`)
    }
    catch(err) {
        throw err ;
    }
}