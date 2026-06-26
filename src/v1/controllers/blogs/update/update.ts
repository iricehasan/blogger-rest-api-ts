import { z } from "zod";
import prisma from "../../../../lib/prisma";
import asyncHandler from "../../../../middleware/asyncHandler";
import { AppError } from "../../../../middleware/errorHandler";
import { blogSchema } from "../schemas";

type BlogBody = z.infer<typeof blogSchema>;

export const updateBlog = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) throw new AppError(401, "Unauthorized");

  const blogId = req.params.id as string;
  const blog = await prisma.blog.findUnique({ where: { id: blogId } });

  if (!blog) {
    res.status(404).json({ message: "Blog not found" });
    return;
  }
  if (blog.authorId !== currentUser.id) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const { title, content, imageUrl }: BlogBody = req.body;
  const updatedBlog = await prisma.blog.update({
    where: { id: blogId },
    data: { title, content, imageUrl },
  });

  req.log.info({ blogId }, "Updated blog");
  res.status(200).json(updatedBlog);
});
