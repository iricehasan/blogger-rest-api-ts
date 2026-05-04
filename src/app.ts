import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logger, httpLogger } from "./middleware/logger";
import errorHandler from "./middleware/errorHandler";
import userRoutes from "./v1/routes/usersRoute";
import blogRoutes from "./v1/routes/blogsRoute";
import authRoutes from "./v1/routes/authRoute";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(httpLogger);
app.use(express.json());

app.get("/health", (_req: Request, res: Response): void => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
