import { Router } from "express";
import { register, login, logout, me, refresh, changePassword } from "../controllers/auth";
import authenticate from "../../middleware/authenticate";
import validate from "../../middleware/validate";
import { loginLimiter, registerLimiter, refreshLimiter } from "../../middleware/rateLimiter";
import { registerSchema, loginSchema, changePasswordSchema } from "../controllers/auth/schemas";

const router = Router();

router.post("/register", registerLimiter, validate(registerSchema), register);
router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/logout", authenticate, logout);
router.post("/refresh", refreshLimiter, refresh);
router.get("/me", authenticate, me);
router.post("/change-password", authenticate, validate(changePasswordSchema), changePassword);

export default router;
