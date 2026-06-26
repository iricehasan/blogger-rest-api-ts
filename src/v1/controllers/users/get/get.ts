import { getPaginationParams, buildMeta } from "../../../../lib/paginate";
import prisma from "../../../../lib/prisma";
import asyncHandler from "../../../../middleware/asyncHandler";

const USER_QUERY = {
  omit: { password: true },
  include: { blogs: true },
};

export const getUser = asyncHandler(async (req, res) => {
  const userId = req.params.id as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    ...USER_QUERY,
  });

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
    prisma.user.findMany({
      ...USER_QUERY,
      take: limit,
      skip,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);

  req.log.info("Fetched all users");
  res.json({ data: users, meta: buildMeta(total, page, limit) });
});
