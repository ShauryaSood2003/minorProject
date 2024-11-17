import { Router } from "express";
import { userLogin, userLogout, userSignup, refreshTheAccessToken, editProfile, deactivateAccount, changePassword } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router() ;



router.post("/signup", userSignup)

router.post("/login", userLogin)

router.post("/logout", userLogout) 

router.post("/refresh-access-token", refreshTheAccessToken) ;

router.post("/editProfile",authenticate,editProfile) 

router.post("/deactivateAccount",authenticate, deactivateAccount) 

router.post("/changePassword", authenticate,changePassword) 

export default router ;