import {GoogleGenerativeAI} from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.API_SECRET_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export {aiModel} ;