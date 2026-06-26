"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const logger_1 = require("./middleware/logger");
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const usersRoute_1 = __importDefault(require("./v1/routes/usersRoute"));
const blogsRoute_1 = __importDefault(require("./v1/routes/blogsRoute"));
const authRoute_1 = __importDefault(require("./v1/routes/authRoute"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: "http://localhost:5173", credentials: true }));
app.use((0, cookie_parser_1.default)());
app.use(logger_1.httpLogger);
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});
app.use("/api/v1/users", usersRoute_1.default);
app.use("/api/v1/blogs", blogsRoute_1.default);
app.use("/api/v1/auth", authRoute_1.default);
app.use(errorHandler_1.default);
exports.default = app;
