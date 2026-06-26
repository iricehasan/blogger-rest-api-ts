"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.me = exports.refresh = exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = require("crypto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../../../lib/prisma"));
const asyncHandler_1 = __importDefault(require("../../../middleware/asyncHandler"));
const errorHandler_1 = require("../../../middleware/errorHandler");
function requireEnv(name) {
    const value = process.env[name];
    if (!value)
        throw new Error(`${name} is not set`);
    return value;
}
function generateAccessToken(userId, role) {
    return jsonwebtoken_1.default.sign({ userId, role }, requireEnv("JWT_SECRET"), { expiresIn: "15m" });
}
function generateRefreshToken(userId, role) {
    return jsonwebtoken_1.default.sign({ userId, role, jti: (0, crypto_1.randomUUID)() }, requireEnv("JWT_REFRESH_SECRET"), { expiresIn: "7d" });
}
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
exports.register = (0, asyncHandler_1.default)(async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const user = await prisma_1.default.user.create({
        data: { name, email, password: hashedPassword },
    });
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);
    await prisma_1.default.refreshToken.create({ data: { token: refreshToken, userId: user.id } });
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    req.log.info({ userId: user.id }, "User registered");
    res.status(201).json({
        accessToken,
        user: { id: user.id, name: user.name, role: user.role, email: user.email },
    });
});
exports.login = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
    }
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);
    await prisma_1.default.refreshToken.create({ data: { token: refreshToken, userId: user.id } });
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    req.log.info({ userId: user.id }, "User logged in");
    res.json({ accessToken, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
});
exports.logout = (0, asyncHandler_1.default)(async (req, res) => {
    const currentUser = req.user;
    if (!currentUser)
        throw new errorHandler_1.AppError(401, "Unauthorized");
    const token = req.cookies["refreshToken"];
    if (token) {
        await prisma_1.default.refreshToken.deleteMany({ where: { token } });
    }
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    req.log.info({ userId: currentUser.id }, "User logged out");
    res.status(204).send();
});
exports.refresh = (0, asyncHandler_1.default)(async (req, res) => {
    const token = req.cookies["refreshToken"];
    if (!token) {
        res.status(401).json({ message: "Refresh token missing" });
        return;
    }
    const stored = await prisma_1.default.refreshToken.findUnique({ where: { token } });
    if (!stored) {
        res.status(401).json({ message: "Invalid refresh token" });
        return;
    }
    let payload;
    try {
        const raw = jsonwebtoken_1.default.verify(token, requireEnv("JWT_REFRESH_SECRET"));
        if (typeof raw === "string")
            throw new Error("Unexpected string payload");
        payload = raw;
    }
    catch {
        await prisma_1.default.refreshToken.deleteMany({ where: { token } });
        res.status(401).json({ message: "Refresh token expired" });
        return;
    }
    const newRefreshToken = generateRefreshToken(payload.userId, payload.role);
    await prisma_1.default.refreshToken.delete({ where: { token } });
    await prisma_1.default.refreshToken.create({ data: { token: newRefreshToken, userId: payload.userId } });
    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
    const accessToken = generateAccessToken(payload.userId, payload.role);
    req.log.info({ userId: payload.userId }, "Token refreshed");
    res.json({ accessToken });
});
exports.me = (0, asyncHandler_1.default)(async (req, res) => {
    const currentUser = req.user;
    if (!currentUser)
        throw new errorHandler_1.AppError(401, "Unauthorized");
    const user = await prisma_1.default.user.findUnique({
        where: { id: currentUser.id },
        select: { id: true, name: true, email: true, role: true },
    });
    req.log.info({ userId: currentUser.id }, "Fetched current user");
    res.status(200).json(user);
});
exports.changePassword = (0, asyncHandler_1.default)(async (req, res) => {
    const currentUser = req.user;
    if (!currentUser)
        throw new errorHandler_1.AppError(401, "Unauthorized");
    const { currentPassword, newPassword } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { id: currentUser.id } });
    if (!user)
        throw new errorHandler_1.AppError(404, "User not found");
    if (!(await bcrypt_1.default.compare(currentPassword, user.password))) {
        res.status(401).json({ message: "Current password is incorrect" });
        return;
    }
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
    await prisma_1.default.user.update({
        where: { id: currentUser.id },
        data: { password: hashedPassword },
    });
    res.status(204).send();
});
