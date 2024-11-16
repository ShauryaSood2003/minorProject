import { Router } from "express";
import { userLogin, userLogout, userSignup, refreshTheAccessToken } from "../controllers/auth.controller.js";

const router = Router() ;



router.post("/signup", userSignup)

router.post("/login", userLogin)

router.post("/logout", userLogout) 

router.post("/refresh-access-token", refreshTheAccessToken) ;

export default router ;