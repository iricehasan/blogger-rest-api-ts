import { Request } from "express";
import { z } from "zod";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  limit: z.coerce.number().int().min(1).max(100).catch(10),
});

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function getPaginationParams(req: Request): { page: number; limit: number; skip: number } {
  const { page, limit } = paginationSchema.parse({
    page: req.query["page"],
    limit: req.query["limit"],
  });
  return { page, limit, skip: (page - 1) * limit };
}

export function buildMeta(total: number, page: number, limit: number): PaginationMeta {
  return { total, page, limit, totalPages: Math.ceil(total / limit) };
}
