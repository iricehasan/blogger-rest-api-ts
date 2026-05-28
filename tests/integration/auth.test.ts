import request from "supertest";
import app from "../../src/app";
import prisma from "../../src/lib/prisma";

const TEST_EMAIL = `test-auth-${Date.now()}@example.com`;
const TEST_PASSWORD = "password123";

let createdUserId: string;

afterAll(async () => {
  if (createdUserId) {
    await prisma.user.delete({ where: { id: createdUserId } }).catch(() => {});
  }
  await prisma.$disconnect();
});

describe("POST /api/v1/auth/register", () => {
  it("returns 201 with access token and user on success", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      name: "Test User",
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body.user).toMatchObject({ email: TEST_EMAIL, role: "NormalUser" });
    expect(res.body.user).not.toHaveProperty("password");
    createdUserId = res.body.user.id;
  });

  it("returns 409 when email is already registered", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      name: "Test User",
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    expect(res.status).toBe(409);
  });
});

describe("POST /api/v1/auth/login", () => {
  it("returns 200 with access token on valid credentials", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });

  it("returns 401 on wrong password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: TEST_EMAIL, password: "wrongpassword" });

    expect(res.status).toBe(401);
  });

  it("returns 401 on unknown email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "noone@example.com", password: TEST_PASSWORD });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/auth/me", () => {
  let accessToken: string;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    accessToken = res.body.accessToken;
  });

  it("returns 200 with current user when authenticated", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ email: TEST_EMAIL });
    expect(res.body).not.toHaveProperty("password");
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });
});
