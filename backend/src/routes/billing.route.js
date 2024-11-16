import {Router} from "express";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router() ;

router.get("/billingAccount",authenticate);
router.get("/buytoken",authenticate);

export default router ;