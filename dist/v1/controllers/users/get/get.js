"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.getUser = void 0;
const paginate_1 = require("../../../../lib/paginate");
const prisma_1 = __importDefault(require("../../../../lib/prisma"));
const asyncHandler_1 = __importDefault(require("../../../../middleware/asyncHandler"));
const USER_QUERY = {
    omit: { password: true },
    include: { blogs: true },
};
exports.getUser = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.params.id;
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        ...USER_QUERY,
    });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    req.log.info({ userId }, "Fetched user");
    res.json(user);
});
exports.getAllUsers = (0, asyncHandler_1.default)(async (req, res) => {
    const { page, limit, skip } = (0, paginate_1.getPaginationParams)(req);
    const [users, total] = await Promise.all([
        prisma_1.default.user.findMany({
            ...USER_QUERY,
            take: limit,
            skip,
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.default.user.count(),
    ]);
    req.log.info("Fetched all users");
    res.json({ data: users, meta: (0, paginate_1.buildMeta)(total, page, limit) });
});
