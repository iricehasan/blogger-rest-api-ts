import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { CookieOptions } from "express";
import { z } from "zod";
import prisma from "../../../lib/prisma";
import asyncHandler from "../../../middleware/asyncHandler";
import { AppError } from "../../../middleware/errorHandler";
import { TokenPayload } from "../../../types/jwt";
import { Role } from "@prisma/client";
import { registerSchema, loginSchema, changePasswordSchema } from "./schemas";

type RegisterBody = z.infer<typeof registerSchema>;
type LoginBody = z.infer<typeof loginSchema>;
type ChangePasswordBody = z.infer<typeof changePasswordSchema>;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function generateAccessToken(userId: string, role: Role): string {
  return jwt.sign({ userId, role }, requireEnv("JWT_SECRET"), { expiresIn: "15m" });
}

function generateRefreshToken(userId: string, role: Role): string {
  return jwt.sign({ userId, role }, requireEnv("JWT_REFRESH_SECRET"), { expiresIn: "7d" });
}

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password }: RegisterBody = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id } });

  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
  req.log.info({ userId: user.id }, "User registered");
  res.status(201).json({
    accessToken,
    user: { id: user.id, name: user.name, role: user.role, email: user.email },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password }: LoginBody = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id } });

  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
  req.log.info({ userId: user.id }, "User logged in");
  res.json({ accessToken, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
});

export const logout = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) throw new AppError(401, "Unauthorized");

  const token = req.cookies["refreshToken"] as string | undefined;
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  res.clearCookie("refreshToken", COOKIE_OPTIONS);
  req.log.info({ userId: currentUser.id }, "User logged out");
  res.status(204).send();
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies["refreshToken"] as string | undefined;

  if (!token) {
    res.status(401).json({ message: "Refresh token missing" });
    return;
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored) {
    res.status(401).json({ message: "Invalid refresh token" });
    return;
  }

  let payload: TokenPayload;
  try {
    const raw = jwt.verify(token, requireEnv("JWT_REFRESH_SECRET"));
    if (typeof raw === "string") throw new Error("Unexpected string payload");
    payload = raw as TokenPayload;
  } catch {
    await prisma.refreshToken.deleteMany({ where: { token } });
    res.status(401).json({ message: "Refresh token expired" });
    return;
  }

  const newRefreshToken = generateRefreshToken(payload.userId, payload.role);

  await prisma.refreshToken.delete({ where: { token } });
  await prisma.refreshToken.create({ data: { token: newRefreshToken, userId: payload.userId } });

  res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);

  const accessToken = generateAccessToken(payload.userId, payload.role);
  req.log.info({ userId: payload.userId }, "Token refreshed");
  res.json({ accessToken });
});

export const me = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) throw new AppError(401, "Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { id: true, name: true, email: true, role: true },
  });

  req.log.info({ userId: currentUser.id }, "Fetched current user");
  res.status(200).json(user);
});

export const changePassword = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) throw new AppError(401, "Unauthorized");

  const { currentPassword, newPassword }: ChangePasswordBody = req.body;
  const user = await prisma.user.findUnique({ where: { id: currentUser.id } });
  if (!user) throw new AppError(404, "User not found");

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    res.status(401).json({ message: "Current password is incorrect" });
    return;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: currentUser.id },
    data: { password: hashedPassword },
  });

  res.status(204).send();
});
