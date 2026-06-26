import prisma from "../../../../lib/prisma";
import asyncHandler from "../../../../middleware/asyncHandler";
import { AppError } from "../../../../middleware/errorHandler";

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
