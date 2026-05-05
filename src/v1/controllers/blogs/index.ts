import { z } from "zod";
import prisma from "../../../lib/prisma";
import asyncHandler from "../../../middleware/asyncHandler";
import { AppError } from "../../../middleware/errorHandler";
import { getPaginationParams, buildMeta } from "../../../lib/paginate";
import { blogSchema } from "./schemas";

type BlogBody = z.infer<typeof blogSchema>;

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

export const deleteBlog = asyncHandler(async (req, res) => {
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

  await prisma.blog.delete({ where: { id: blogId } });
  req.log.info({ blogId }, "Deleted blog");
  res.status(204).send();
});
