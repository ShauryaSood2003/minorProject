import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./databases/index.js";
import { aiModel } from "./utils/aiModel.js";
dotenv.config();
import cors from "cors"

const PORT = process.env.PORT  ;
// console.log(PORT) ;

const app=express();

app.use(cors({
    origin: "*",
    credentials: true,
}))


app.use(express.json());

app.use(express.urlencoded({ extended: true })) ;  // to accept url encoded data and extended true lets us to parse nested objects in the url encoded data


// app.use(express.static("public"))  ;   // to serve static files to the user



app.get("/", (req, res) => {
    res.status(200).json({ message: "Hello from backend" });
})

app.post("/test", async (req,res)=>{

    // call the gemini api 

    console.log("req.body", req.body) ;

    const prompt = req.body.message;

    let result = await aiModel.generateContent(prompt);
    result = result.response.text() ;
    console.log(result);

    // const result = "reply from ai"

    
    res.status(200).json({reply: result});
})


// routes
import authRouter from "./routes/auth.route.js"
import chatRouter from "./routes/chat.route.js"
import billingRouter from "./routes/billing.route.js"


app.use("/api/v1/auth", authRouter) ;
app.use("/api/v1/chat", chatRouter) ;
app.use("/api/v1/billing", billingRouter) ;


// connect to the database
connectDB()
.then((dbInstance) => {
    console.log(`Database connected successfully: ${dbInstance.connection.host}`)

    app.listen(PORT, () => console.log(`App listening on port ${PORT}`))
    
})
.catch((err) => console.log(err)) ;


