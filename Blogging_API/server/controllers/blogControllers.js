const mongoose = require("mongoose");
const Blog = require("./../models/blogModel");
const calculateReadingTime = require("./../utils/calculatedReadingTime");

// Create a new blog
const createBlog = async (userId, blogData) => {
  const { title, description, body, tags, state } = blogData;

  if (!title || !body) {
    throw new Error("Title and body are required.");
  }

  const reading_time = calculateReadingTime(body);

  const newBlog = await Blog.create({
    title,
    description,
    body,
    tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
    author: userId,
    state: state || "draft",
    reading_time,
  });

  return newBlog;
};

// Get all blogs by the logged-in user
const getMyBlogs = async (userId, query) => {
  const { page = 1, limit = 20, state } = query;

  const filter = { author: userId };
  if (state) filter.state = state;

  const blogs = await Blog.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return blogs;
};

// Get all published blogs
const getBlogs = async (query) => {
  const { page = 1, limit = 20, search, orderBy = "createdAt", order = "desc" } = query;

  const filter = { state: "published" };
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const sortOptions = { [orderBy]: order === "asc" ? 1 : -1 };

  const blogs = await Blog.find(filter)
    .populate("author", "first_name last_name email")
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return blogs;
};

// Get a blog by ID
const getBlogById = async (id) => {
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid blog ID.");
  }

  const blog = await Blog.findById(id).populate("author", "first_name last_name email");

  if (!blog) {
    throw new Error("Blog not found.");
  }

  blog.read_count += 1;
  await blog.save();

  return blog;
};

// Update a blog
const updateBlog = async (userId, blogId, updateData) => {
    try {
      const blog = await Blog.findById(blogId);
  
      if (!blog) {
        throw new Error("Blog not found");
      }
  
      if (blog.author.toString() !== userId) {
        throw new Error("Unauthorized to update this blog");
      }
  
      // Update only the provided fields
      if (updateData.title) blog.title = updateData.title;
      if (updateData.description) blog.description = updateData.description;
      if (updateData.body) blog.body = updateData.body;
      if (updateData.tags) {
        blog.tags = updateData.tags.split(",").map((tag) => tag.trim());
      }
  
      await blog.save();
    } catch (error) {
      throw new Error(error.message);
    }
  };


  
const updateBlogState = async (userId, blogId, newState) => {
    try {
      // Check if the state is valid
      if (!["draft", "published"].includes(newState)) {
        throw new Error("Invalid state");
      }
  
      const blog = await Blog.findById(blogId);
  
      if (!blog) {
        throw new Error("Blog not found");
      }
  
      // Ensure only the owner can update the state
      if (blog.author.toString() !== userId) {
        throw new Error("Unauthorized to update the state of this blog");
      }
  
      blog.state = newState;
      await blog.save();
  
      return blog;
    } catch (error) {
      throw new Error(error.message);
    }
  };

// Delete a blog
const deleteBlog = async (userId, blogId) => {
    try {
      const blog = await Blog.findById(blogId);
  
      if (!blog) {
        throw new Error("Blog not found");
      }
  
      if (blog.author.toString() !== userId) {
        throw new Error("Unauthorized to delete this blog");
      }
  
      await blog.remove();
    } catch (error) {
      throw new Error(error.message);
    }
  };

module.exports = {
  createBlog,
  getMyBlogs,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  updateBlogState,
};
