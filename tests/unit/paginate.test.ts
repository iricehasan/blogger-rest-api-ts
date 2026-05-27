import { Request } from "express";
import { buildMeta, getPaginationParams } from "../../src/lib/paginate";

describe("buildMeta", () => {
  it("returns correct totalPages with clean division", () => {
    expect(buildMeta(10, 1, 5).totalPages).toBe(2);
  });

  it("rounds totalPages up", () => {
    expect(buildMeta(11, 1, 5).totalPages).toBe(3);
  });

  it("returns 0 totalPages when total is 0", () => {
    expect(buildMeta(0, 1, 10).totalPages).toBe(0);
  });

  it("passes through total, page, and limit", () => {
    const meta = buildMeta(42, 3, 15);
    expect(meta).toMatchObject({ total: 42, page: 3, limit: 15 });
  });
});

describe("getPaginationParams", () => {
  function mockReq(query: Record<string, string>): Request {
    return { query } as unknown as Request;
  }

  it("returns correct page, limit, and skip", () => {
    const result = getPaginationParams(mockReq({ page: "2", limit: "5" }));
    expect(result).toEqual({ page: 2, limit: 5, skip: 5 });
  });

  it("defaults page to 1 when not provided", () => {
    const result = getPaginationParams(mockReq({ limit: "10" }));
    expect(result.page).toBe(1);
  });

  it("defaults limit to 10 when not provided", () => {
    const result = getPaginationParams(mockReq({ page: "1" }));
    expect(result.limit).toBe(10);
  });

  it("defaults page to 1 on invalid value", () => {
    const result = getPaginationParams(mockReq({ page: "abc" }));
    expect(result.page).toBe(1);
  });

  it("defaults limit to 10 when above max of 100", () => {
    const result = getPaginationParams(mockReq({ limit: "200" }));
    expect(result.limit).toBe(10);
  });

  it("calculates skip as (page - 1) * limit", () => {
    const result = getPaginationParams(mockReq({ page: "3", limit: "10" }));
    expect(result.skip).toBe(20);
  });
});
