import express from "express";
import {
  signup,
  login,
  refresh,
  logout,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  resetPassword,
} from "../controller/auth.controller.js";

const authRouter = express.Router();

authRouter.route("/signup").post(signup);
authRouter.route("/verify-email").post(verifyEmail);
authRouter.route("/resend-verification").post(resendVerificationCode);
authRouter.route("/login").post(login);
authRouter.route("/logout").post(logout);
authRouter.route("/refresh").post(refresh);
authRouter.route("/forgot-password").post(forgotPassword);
authRouter.route("/reset-password").post(resetPassword);

export default authRouter;
