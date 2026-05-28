import request from "supertest";
import app from "../../src/app";
import prisma from "../../src/lib/prisma";

const TEST_EMAIL = `test-blogs-${Date.now()}@example.com`;
const TEST_PASSWORD = "password123";

let accessToken: string;
let userId: string;
let blogId: string;

beforeAll(async () => {
  const res = await request(app).post("/api/v1/auth/register").send({
    name: "Blog Test User",
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  accessToken = res.body.accessToken;
  userId = res.body.user.id;
});

afterAll(async () => {
  await prisma.user.delete({ where: { id: userId } }).catch(() => {});
  await prisma.$disconnect();
});

describe("GET /api/v1/blogs", () => {
  it("returns 200 with data array and meta", async () => {
    const res = await request(app).get("/api/v1/blogs");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty("meta");
  });

  it("meta contains total, page, limit, and totalPages", async () => {
    const res = await request(app).get("/api/v1/blogs");

    expect(res.body.meta).toMatchObject({ page: 1, limit: 10 });
    expect(res.body.meta).toHaveProperty("total");
    expect(res.body.meta).toHaveProperty("totalPages");
  });

  it("respects page and limit query params", async () => {
    const res = await request(app).get("/api/v1/blogs?page=1&limit=5");

    expect(res.status).toBe(200);
    expect(res.body.meta.limit).toBe(5);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
  });
});

describe("POST /api/v1/blogs", () => {
  it("returns 201 and creates a blog when authenticated", async () => {
    const res = await request(app)
      .post("/api/v1/blogs")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Test Blog", content: "Test content", imageUrl: "https://example.com/img.jpg" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: "Test Blog" });
    blogId = res.body.id;
  });

  it("returns 401 when not authenticated", async () => {
    const res = await request(app)
      .post("/api/v1/blogs")
      .send({ title: "Test Blog", content: "Test content", imageUrl: "https://example.com/img.jpg" });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/blogs/:id", () => {
  it("returns 200 and the blog for a valid id", async () => {
    const res = await request(app).get(`/api/v1/blogs/${blogId}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: blogId, title: "Test Blog" });
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app).get("/api/v1/blogs/00000000-0000-0000-0000-000000000000");
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/v1/blogs/:id", () => {
  it("returns 200 and updates the blog when authenticated as author", async () => {
    const res = await request(app)
      .put(`/api/v1/blogs/${blogId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Updated Title", content: "Updated content", imageUrl: "https://example.com/img.jpg" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated Title");
  });

  it("returns 401 when not authenticated", async () => {
    const res = await request(app)
      .put(`/api/v1/blogs/${blogId}`)
      .send({ title: "Updated Title", content: "Updated content", imageUrl: "https://example.com/img.jpg" });

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/v1/blogs/:id", () => {
  it("returns 204 and deletes the blog when authenticated as author", async () => {
    const res = await request(app)
      .delete(`/api/v1/blogs/${blogId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(204);
  });

  it("returns 404 after blog is deleted", async () => {
    const res = await request(app).get(`/api/v1/blogs/${blogId}`);
    expect(res.status).toBe(404);
  });
});
