"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
class AppError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AppError";
    }
}
exports.AppError = AppError;
const PRISMA_ERROR_MAP = {
    P2002: { status: 409, message: "Resource already exists" },
    P2025: { status: 404, message: "Resource not found" },
    P2003: { status: 400, message: "Invalid reference: related record not found" },
    P2000: { status: 400, message: "Input value too long" },
    P2011: { status: 400, message: "Null constraint violation" },
};
function errorHandler(err, _req, res, _next) {
    logger_1.logger.error({ err }, "Unhandled error");
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        const mapped = PRISMA_ERROR_MAP[err.code];
        if (mapped) {
            res.status(mapped.status).json({ error: mapped.message });
            return;
        }
    }
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }
    const message = process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err instanceof Error
            ? err.message
            : "Internal server error";
    res.status(500).json({ error: message });
}
exports.default = errorHandler;
