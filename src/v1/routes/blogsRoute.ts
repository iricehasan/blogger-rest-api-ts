import { Router } from "express";
import { getBlog, getAllBlogs, createBlog, updateBlog, deleteBlog } from "../controllers/blogs";
import authenticate from "../../middleware/authenticate";
import validate from "../../middleware/validate";
import { blogSchema } from "../controllers/blogs/schemas";

const router = Router();

router.get("/", getAllBlogs);
router.post("/", authenticate, validate(blogSchema), createBlog);
router.get("/:id", getBlog);
router.put("/:id", authenticate, validate(blogSchema), updateBlog);
router.delete("/:id", authenticate, deleteBlog);

export default router;
