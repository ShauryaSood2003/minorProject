import {Router} from "express";
import { billingAccount, buyTokens,createOrder, getProfile } from "../controllers/billing.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router() ;

router.post("/billingAccount",authenticate, billingAccount);
router.post("/createOrder",authenticate,createOrder);
router.post("/buytoken",authenticate,buyTokens);
router.post("/userProfile",authenticate,getProfile);

export default router ;