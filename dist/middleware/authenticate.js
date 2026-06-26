"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Authorization header missing" });
        return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Authorization header missing" });
        return;
    }
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error("JWT_SECRET is not set");
    try {
        const raw = jsonwebtoken_1.default.verify(token, secret);
        if (typeof raw === "string") {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        const payload = raw;
        req.user = { id: payload.userId, role: payload.role };
        next();
    }
    catch (err) {
        if (err instanceof Error && err.name === "TokenExpiredError") {
            res.status(401).json({ message: "Token expired" });
            return;
        }
        res.status(401).json({ message: "Invalid token" });
    }
}
exports.default = authenticate;
