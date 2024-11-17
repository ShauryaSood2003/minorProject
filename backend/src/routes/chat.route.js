import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {  getAllConversation, getParticulartConversation,addNewChatsToConversation } from "../controllers/chat.controller.js";

const router = Router() ;

router.post("/all", authenticate, getAllConversation)
router.post("/one", authenticate, getParticulartConversation)
router.patch("/append", authenticate, addNewChatsToConversation)
// router.patch("/new", authenticate, addNewConversation)



export default router ;