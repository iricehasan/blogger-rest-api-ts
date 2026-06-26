"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlog = void 0;
const prisma_1 = __importDefault(require("../../../../lib/prisma"));
const asyncHandler_1 = __importDefault(require("../../../../middleware/asyncHandler"));
const errorHandler_1 = require("../../../../middleware/errorHandler");
exports.deleteBlog = (0, asyncHandler_1.default)(async (req, res) => {
    const currentUser = req.user;
    if (!currentUser)
        throw new errorHandler_1.AppError(401, "Unauthorized");
    const blogId = req.params.id;
    const blog = await prisma_1.default.blog.findUnique({ where: { id: blogId } });
    if (!blog) {
        res.status(404).json({ message: "Blog not found" });
        return;
    }
    if (blog.authorId !== currentUser.id) {
        res.status(403).json({ message: "Forbidden" });
        return;
    }
    await prisma_1.default.blog.delete({ where: { id: blogId } });
    req.log.info({ blogId }, "Deleted blog");
    res.status(204).send();
});
