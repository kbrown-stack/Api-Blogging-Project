jest.setTimeout(120000); 
const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = require("../app");
const { connectDB, disconnectDB } = require("./../server/config/db");
const User = require("./../server/models/userModel");
const Blog = require("./../server/models/blogModel");

describe("Blog API Endpoints", () => {
  beforeAll(async () => {
    await connectDB(); 
  });

  afterAll(async () => {
    await disconnectDB();
  });

  let user, token;

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create a test user
    user = await User.create({
      first_name: "Test",
      last_name: "User",
      email: "testuser@example.com",
      password: hashedPassword,
    });

    // Generate a valid JWT token
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  });

  afterEach(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});
  });

  // Test fetching all published blogs
  describe("GET /api/blogs", () => {
    it("should fetch all published blogs", async () => {
      await Blog.create([
        {
          title: "Published Blog 1",
          body: "This is the first published blog.",
          tags: ["test", "blog"],
          state: "published",
          author: user._id,
        },
        {
          title: "Draft Blog 1",
          body: "This is a draft blog.",
          tags: ["draft"],
          state: "draft",
          author: user._id,
        },
      ]);

      const res = await request(app)
        .get("/api/blogs")
        .set("Cookie", [`token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.text).toContain("Published Blog 1");
      expect(res.text).not.toContain("Draft Blog 1");
    });
  });

  // Test creating a new blog
  describe("POST /api/blogs", () => {
    it("should create a new blog", async () => {
      const res = await request(app)
        .post("/api/blogs")
        .set("Cookie", [`token=${token}`])
        .send({
          title: "New Blog",
          body: "This is a new blog post.",
          tags: "tag1, tag2",
        });

      expect(res.status).toBe(302); 
      const blogs = await Blog.find({});
      expect(blogs.length).toBe(1);
      expect(blogs[0].title).toBe("New Blog");
    });
  });

  // Test fetching a single blog by ID
  describe("GET /api/blogs/:id", () => {
    it("should fetch a single blog by ID", async () => {
      const blog = await Blog.create({
        title: "Single Blog",
        body: "This is a blog post.",
        tags: ["test"],
        state: "published",
        author: user._id,
      });

      const res = await request(app)
        .get(`/api/blogs/${blog._id}`)
        .set("Cookie", [`token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.text).toContain("Single Blog");
    });
  });

  // Test updating a blog
  describe("PUT /api/blogs/:id", () => {
    it("should update a blog", async () => {
      const blog = await Blog.create({
        title: "Blog to Update",
        body: "This is the original content.",
        tags: ["update"],
        state: "published",
        author: user._id,
      });

      const res = await request(app)
        .put(`/api/blogs/${blog._id}`)
        .set("Cookie", [`token=${token}`])
        .send({
          title: "Updated Blog",
          body: "This is the updated content.",
          tags: "updated, blog",
        });

      expect(res.status).toBe(302); 
      const updatedBlog = await Blog.findById(blog._id);
      expect(updatedBlog.title).toBe("Updated Blog");
    });
  });

  // Test deleting a blog
  describe("DELETE /api/blogs/:id", () => {
    it("should delete a blog", async () => {
      const blog = await Blog.create({
        title: "Blog to Delete",
        body: "This blog will be deleted.",
        tags: ["delete"],
        state: "published",
        author: user._id,
      });

      const res = await request(app)
        .delete(`/api/blogs/${blog._id}`)
        .set("Cookie", [`token=${token}`]);

      expect(res.status).toBe(302); 
      const deletedBlog = await Blog.findById(blog._id);
      expect(deletedBlog).toBeNull();
    });
  });
});

