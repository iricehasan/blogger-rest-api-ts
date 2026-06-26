import prisma from "../../../../lib/prisma";
import asyncHandler from "../../../../middleware/asyncHandler";
import { getPaginationParams, buildMeta } from "../../../../lib/paginate";

export const getBlog = asyncHandler(async (req, res) => {
  const blogId = req.params.id as string;
  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    include: { author: { omit: { password: true } } },
  });

  if (!blog) {
    res.status(404).json({ message: "Blog not found" });
    return;
  }

  req.log.info({ blogId }, "Fetched blog");
  res.status(200).json(blog);
});

export const getAllBlogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req);

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      include: { author: { omit: { password: true } } },
      take: limit,
      skip,
      orderBy: { createdAt: "desc" },
    }),
    prisma.blog.count(),
  ]);

  req.log.info("Fetched all blogs");
  res.status(200).json({ data: blogs, meta: buildMeta(total, page, limit) });
});
