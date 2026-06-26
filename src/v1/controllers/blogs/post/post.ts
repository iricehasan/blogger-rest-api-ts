import { z } from "zod";
import prisma from "../../../../lib/prisma";
import asyncHandler from "../../../../middleware/asyncHandler";
import { AppError } from "../../../../middleware/errorHandler";
import { blogSchema } from "../schemas";

type BlogBody = z.infer<typeof blogSchema>;

export const createBlog = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) throw new AppError(401, "Unauthorized");

  const { title, content, imageUrl }: BlogBody = req.body;

  const blog = await prisma.blog.create({
    data: { title, content, imageUrl, authorId: currentUser.id },
  });

  req.log.info({ title, authorId: currentUser.id }, "Created blog");
  res.status(201).json(blog);
});
