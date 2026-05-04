import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { logger } from "./logger";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

const PRISMA_ERROR_MAP: Record<string, { status: number; message: string }> = {
  P2002: { status: 409, message: "Resource already exists" },
  P2025: { status: 404, message: "Resource not found" },
  P2003: { status: 400, message: "Invalid reference: related record not found" },
  P2000: { status: 400, message: "Input value too long" },
  P2011: { status: 400, message: "Null constraint violation" },
};

function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  logger.error({ err }, "Unhandled error");

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
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

  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err instanceof Error
        ? err.message
        : "Internal server error";

  res.status(500).json({ error: message });
}

export default errorHandler;
