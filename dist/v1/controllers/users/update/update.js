"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = void 0;
const prisma_1 = __importDefault(require("../../../../lib/prisma"));
const asyncHandler_1 = __importDefault(require("../../../../middleware/asyncHandler"));
const errorHandler_1 = require("../../../../middleware/errorHandler");
exports.updateUser = (0, asyncHandler_1.default)(async (req, res) => {
    const currentUser = req.user;
    if (!currentUser)
        throw new errorHandler_1.AppError(401, "Unauthorized");
    const userId = req.params.id;
    if (currentUser.id !== userId) {
        res.status(403).json({ message: "Forbidden" });
        return;
    }
    const { name, email } = req.body;
    const role = currentUser.role === "Admin"
        ? (req.body.role ?? "NormalUser")
        : "NormalUser";
    const user = await prisma_1.default.user.update({
        where: { id: userId },
        data: { name, email, role },
        omit: { password: true },
    });
    req.log.info({ name, email, role }, "Updated user");
    res.status(200).json(user);
});
