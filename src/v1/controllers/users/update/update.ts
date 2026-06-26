import { z } from "zod";
import prisma from "../../../../lib/prisma";
import asyncHandler from "../../../../middleware/asyncHandler";
import { AppError } from "../../../../middleware/errorHandler";
import { Role } from "@prisma/client";
import { updateUserSchema } from "../schemas";

type UpdateUserBody = z.infer<typeof updateUserSchema>;

export const updateUser = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) throw new AppError(401, "Unauthorized");

  const userId = req.params.id as string;
  if (currentUser.id !== userId) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const { name, email }: UpdateUserBody = req.body;
  const role: Role =
    currentUser.role === "Admin"
      ? (req.body.role ?? "NormalUser")
      : "NormalUser";

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, email, role },
    omit: { password: true },
  });

  req.log.info({ name, email, role }, "Updated user");
  res.status(200).json(user);
});
