import request from "supertest";
import bcrypt from "bcrypt";
import app from "../../src/app";
import prisma from "../../src/lib/prisma";

const NORMAL_EMAIL = `test-user-${Date.now()}@example.com`;
const OTHER_EMAIL = `test-other-${Date.now()}@example.com`;
const ADMIN_EMAIL = `test-admin-${Date.now()}@example.com`;
const TEST_PASSWORD = "password123";

let normalToken: string;
let normalUserId: string;
let otherUserId: string;
let adminToken: string;
let adminUserId: string;

beforeAll(async () => {
  const normalRes = await request(app).post("/api/v1/auth/register").send({
    name: "Normal User",
    email: NORMAL_EMAIL,
    password: TEST_PASSWORD,
  });
  normalToken = normalRes.body.accessToken;
  normalUserId = normalRes.body.user.id;

  const otherRes = await request(app).post("/api/v1/auth/register").send({
    name: "Other User",
    email: OTHER_EMAIL,
    password: TEST_PASSWORD,
  });
  otherUserId = otherRes.body.user.id;

  // Register endpoint doesn't support setting Admin role — create directly via Prisma
  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
  const admin = await prisma.user.create({
    data: { name: "Admin User", email: ADMIN_EMAIL, password: hashedPassword, role: "Admin" },
  });
  adminUserId = admin.id;

  const adminLogin = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: ADMIN_EMAIL, password: TEST_PASSWORD });
  adminToken = adminLogin.body.accessToken;
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: { id: { in: [normalUserId, otherUserId, adminUserId].filter(Boolean) } },
  });
  await prisma.$disconnect();
});

describe("GET /api/v1/users", () => {
  it("returns 200 with data and meta for Admin", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty("meta");
  });

  it("returns 403 for a NormalUser", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${normalToken}`);

    expect(res.status).toBe(403);
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/v1/users");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/users/:id", () => {
  it("returns 200 and user data without password", async () => {
    const res = await request(app).get(`/api/v1/users/${normalUserId}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: normalUserId });
    expect(res.body).not.toHaveProperty("password");
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app).get("/api/v1/users/00000000-0000-0000-0000-000000000000");
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/v1/users/:id", () => {
  it("returns 200 and updates the user when authenticated as owner", async () => {
    const res = await request(app)
      .put(`/api/v1/users/${normalUserId}`)
      .set("Authorization", `Bearer ${normalToken}`)
      .send({ name: "Updated Name", email: NORMAL_EMAIL });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Name");
  });

  it("returns 403 when updating another user's profile", async () => {
    const res = await request(app)
      .put(`/api/v1/users/${otherUserId}`)
      .set("Authorization", `Bearer ${normalToken}`)
      .send({ name: "Hacked", email: OTHER_EMAIL });

    expect(res.status).toBe(403);
  });

  it("returns 401 without a token", async () => {
    const res = await request(app)
      .put(`/api/v1/users/${normalUserId}`)
      .send({ name: "No Auth", email: NORMAL_EMAIL });

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/v1/users/:id", () => {
  it("returns 403 when deleting another user's account", async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${otherUserId}`)
      .set("Authorization", `Bearer ${normalToken}`);

    expect(res.status).toBe(403);
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).delete(`/api/v1/users/${normalUserId}`);
    expect(res.status).toBe(401);
  });

  it("returns 204 when deleting own account", async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${normalUserId}`)
      .set("Authorization", `Bearer ${normalToken}`);

    expect(res.status).toBe(204);
  });
});
