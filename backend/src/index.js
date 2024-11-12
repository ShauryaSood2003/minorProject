import express from "express";

const app=express();

app.use(express.json({}));

app.get("/test",(req,res)=>{
    res.status(200).json({message:"Hello"});
})

app.listen("3000",()=>{
    console.log("Server is running At port 3000!");
})