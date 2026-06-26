"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationParams = getPaginationParams;
exports.buildMeta = buildMeta;
const zod_1 = require("zod");
const paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).catch(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).catch(10),
});
function getPaginationParams(req) {
    const { page, limit } = paginationSchema.parse({
        page: req.query["page"],
        limit: req.query["limit"],
    });
    return { page, limit, skip: (page - 1) * limit };
}
function buildMeta(total, page, limit) {
    return { total, page, limit, totalPages: Math.ceil(total / limit) };
}
