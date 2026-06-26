"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBlog = void 0;
const prisma_1 = __importDefault(require("../../../../lib/prisma"));
const asyncHandler_1 = __importDefault(require("../../../../middleware/asyncHandler"));
const errorHandler_1 = require("../../../../middleware/errorHandler");
exports.createBlog = (0, asyncHandler_1.default)(async (req, res) => {
    const currentUser = req.user;
    if (!currentUser)
        throw new errorHandler_1.AppError(401, "Unauthorized");
    const { title, content, imageUrl } = req.body;
    const blog = await prisma_1.default.blog.create({
        data: { title, content, imageUrl, authorId: currentUser.id },
    });
    req.log.info({ title, authorId: currentUser.id }, "Created blog");
    res.status(201).json(blog);
});
