"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBlogs = exports.getBlog = void 0;
const paginate_1 = require("../../../../lib/paginate");
const prisma_1 = __importDefault(require("../../../../lib/prisma"));
const asyncHandler_1 = __importDefault(require("../../../../middleware/asyncHandler"));
exports.getBlog = (0, asyncHandler_1.default)(async (req, res) => {
    const blogId = req.params.id;
    const blog = await prisma_1.default.blog.findUnique({
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
exports.getAllBlogs = (0, asyncHandler_1.default)(async (req, res) => {
    const { page, limit, skip } = (0, paginate_1.getPaginationParams)(req);
    const [blogs, total] = await Promise.all([
        prisma_1.default.blog.findMany({
            include: { author: { omit: { password: true } } },
            take: limit,
            skip,
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.default.blog.count(),
    ]);
    req.log.info("Fetched all blogs");
    res.status(200).json({ data: blogs, meta: (0, paginate_1.buildMeta)(total, page, limit) });
});
