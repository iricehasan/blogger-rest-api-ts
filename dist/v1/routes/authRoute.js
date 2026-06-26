"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const authenticate_1 = __importDefault(require("../../middleware/authenticate"));
const validate_1 = __importDefault(require("../../middleware/validate"));
const rateLimiter_1 = require("../../middleware/rateLimiter");
const schemas_1 = require("../controllers/auth/schemas");
const router = (0, express_1.Router)();
router.post("/register", rateLimiter_1.registerLimiter, (0, validate_1.default)(schemas_1.registerSchema), auth_1.register);
router.post("/login", rateLimiter_1.loginLimiter, (0, validate_1.default)(schemas_1.loginSchema), auth_1.login);
router.post("/logout", authenticate_1.default, auth_1.logout);
router.post("/refresh", rateLimiter_1.refreshLimiter, auth_1.refresh);
router.get("/me", authenticate_1.default, auth_1.me);
router.post("/change-password", authenticate_1.default, (0, validate_1.default)(schemas_1.changePasswordSchema), auth_1.changePassword);
exports.default = router;
