import { z } from "zod";
import prisma from "../../../lib/prisma";
import asyncHandler from "../../../middleware/asyncHandler";
import { AppError } from "../../../middleware/errorHandler";
import { getPaginationParams, buildMeta } from "../../../lib/paginate";
import { Role } from "@prisma/client";
import { updateUserSchema } from "./schemas";

type UpdateUserBody = z.infer<typeof updateUserSchema>;

const USER_QUERY = {
  omit: { password: true },
  include: { blogs: true },
};

export const getUser = asyncHandler(async (req, res) => {
  const userId = req.params.id as string;
  const user = await prisma.user.findUnique({ where: { id: userId }, ...USER_QUERY });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  req.log.info({ userId }, "Fetched user");
  res.json(user);
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req);

  const [users, total] = await Promise.all([
    prisma.user.findMany({ ...USER_QUERY, take: limit, skip, orderBy: { createdAt: "desc" } }),
    prisma.user.count(),
  ]);

  req.log.info("Fetched all users");
  res.json({ data: users, meta: buildMeta(total, page, limit) });
});

export const updateUser = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) throw new AppError(401, "Unauthorized");

  const userId = req.params.id as string;
  if (currentUser.id !== userId) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const { name, email }: UpdateUserBody = req.body;
  const role: Role = currentUser.role === "Admin" ? (req.body.role ?? "NormalUser") : "NormalUser";

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, email, role },
    omit: { password: true },
  });

  req.log.info({ name, email, role }, "Updated user");
  res.status(200).json(user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) throw new AppError(401, "Unauthorized");

  const userId = req.params.id as string;
  if (currentUser.id !== userId) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  await prisma.user.delete({ where: { id: userId } });
  req.log.info({ userId }, "Deleted user");
  res.status(204).send();
});
