"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBlog = void 0;
const asyncHandler_1 = __importDefault(require("../../../../middleware/asyncHandler"));
const errorHandler_1 = require("../../../../middleware/errorHandler");
const prisma_1 = __importDefault(require("../../../../lib/prisma"));
exports.updateBlog = (0, asyncHandler_1.default)(async (req, res) => {
    const currentUser = req.user;
    if (!currentUser)
        throw new errorHandler_1.AppError(401, "Unauthorized");
    const blogId = req.params.id;
    const { title, content, imageUrl } = req.body;
    // Instead of two requests findUnique and update, single request (atomic)
    const updatedBlog = await prisma_1.default.blog.update({
        where: { id: blogId, authorId: currentUser.id },
        data: { title, content, imageUrl },
    });
    req.log.info({ blogId }, "Updated blog");
    res.status(200).json(updatedBlog);
});
