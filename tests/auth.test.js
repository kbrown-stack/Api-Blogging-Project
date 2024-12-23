jest.setTimeout(120000); 
const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
const { connectDB, disconnectDB } = require("./../server/config/db");
const User = require("./../server/models/userModel");

describe("Authentication Endpoints", () => {
  beforeAll(async () => {
    
    await connectDB();
  });

  afterAll(async () => {
    
    await disconnectDB();
  });

  afterEach(async () => {
    
    await User.deleteMany({});
  });

  describe("User Registration", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app).post("/api/auth/register").send({
        first_name: "John",
        last_name: "Doe",
        email: "johndoe@example.com",
        password: "password123",
      });

      expect(res.status).toBe(302);
      const user = await User.findOne({ email: "johndoe@example.com" });
      expect(user).not.toBeNull();
      expect(user.first_name).toBe("John");
    });

    it("should not register a user with an existing email", async () => {
      await User.create({
        first_name: "Existing",
        last_name: "User",
        email: "existing@example.com",
        password: await bcrypt.hash("password123", 10),
      });

      const res = await request(app).post("/api/auth/register").send({
        first_name: "Another",
        last_name: "User",
        email: "existing@example.com",
        password: "password123",
      });

      expect(res.status).toBe(400);
      expect(res.text).toContain("User already exists");
    });

    it("should not register a user with missing fields", async () => {
      const res = await request(app).post("/api/auth/register").send({
        first_name: "Incomplete",
        email: "incomplete@example.com",
      });

      expect(res.status).toBe(400); 
      expect(res.text).toContain("All fields are required");
    });
  });

  describe("User Login", () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      await User.create({
        first_name: "Test",
        last_name: "User",
        email: "testuser@example.com",
        password: hashedPassword,
      });
    });

    it("should log in an existing user successfully", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "testuser@example.com",
        password: "password123",
      });

      expect(res.status).toBe(302);
      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.startsWith("token"))).toBe(true);
    });

    it("should not log in with an incorrect password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "testuser@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401); 
      expect(res.text).toContain("Invalid email or password");
    });

    it("should not log in a non-existent user", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(res.status).toBe(401); 
      expect(res.text).toContain("Invalid email or password");
    });
  });

  describe("Protected Routes", () => {
    let token;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      const user = await User.create({
        first_name: "Secure",
        last_name: "User",
        email: "secureuser@example.com",
        password: hashedPassword,
      });

      // Log in the user to get the token
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: "secureuser@example.com",
        password: "password123",
      });

      const cookies = loginResponse.headers["set-cookie"];
      expect(cookies).toBeDefined();
      token = cookies.find((c) => c.startsWith("token")).split(";")[0]; 
    });

    it("should allow access to a protected route with valid token", async () => {
      const res = await request(app)
        .get("/api/blogs/my-blogs")
        .set("Cookie", [token]); 

      expect(res.status).toBe(200); 
      expect(res.text).toContain("My Blogs");
    });

    it("should deny access to a protected route without a token", async () => {
      const res = await request(app).get("/api/blogs/my-blogs");

      expect(res.status).toBe(401); 
      expect(res.body.message).toContain("No token provided");
    });

    it("should deny access to a protected route with an invalid token", async () => {
      const res = await request(app)
        .get("/api/blogs/my-blogs")
        .set("Cookie", ["token=invalidtoken"]);

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("Token is invalid or expired");
    });
  });
});
