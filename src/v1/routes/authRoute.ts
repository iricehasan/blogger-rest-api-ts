import { Router } from "express";
import { register, login, logout, me, refresh, changePassword } from "../controllers/auth";
import authenticate from "../../middleware/authenticate";
import validate from "../../middleware/validate";
import { registerSchema, loginSchema, changePasswordSchema } from "../controllers/auth/schemas";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", authenticate, logout);
router.post("/refresh", refresh);
router.get("/me", authenticate, me);
router.post("/change-password", authenticate, validate(changePasswordSchema), changePassword);

export default router;
