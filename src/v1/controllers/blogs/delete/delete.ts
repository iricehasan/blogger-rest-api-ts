import prisma from "../../../../lib/prisma";
import asyncHandler from "../../../../middleware/asyncHandler";
import { AppError } from "../../../../middleware/errorHandler";


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
