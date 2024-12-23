const express = require("express");
const {
  createBlog,
  getMyBlogs,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  updateBlogState,
} = require("../controllers/blogControllers");
const authMiddleware = require("../middlewares/authMiddlewares");
// const authMiddlewares = require('../middlewares/authMiddlewares');

const paginationMiddleware = require("../middlewares/paginationMiddlewares");



const router = express.Router();

// I wrote the comments so that my code will appear clean and maintainable as good practice. 


// Render blog creation page
router.get("/create", authMiddleware, (req, res) => {
  res.render("blogs/create", { title: "Create Blog", user: req.user });
});

// Render all blogs by the logged-in user
router.get("/my-blogs", authMiddleware, paginationMiddleware, async (req, res) => {
  try {
    const blogs = await getMyBlogs(req.user.id, req.query);
    res.render("blogs/myBlogs", { title: "My Blogs", blogs, user: req.user });
  } catch (error) {
    console.error("Error fetching user blogs:", error.message);
    res.status(500).json({ title: "Error", message: error.message });
  }
});

// Render all published blogs
router.get("/", paginationMiddleware, async (req, res) => {
  try {
    // Fetch only published blogs
    const blogs = await getBlogs({ ...req.query, state: "published" });

    console.log("User passed to EJS:", req.user);

    // Render the blog list view, passing blogs and user
    res.render("blogs/blogList", {
      title: "Published Blogs",
      blogs,
      user: req.user || null, // Ensure req.user is included even if null
    });
  } catch (error) {
    console.error("Error fetching published blogs:", error.message);
    res.status(500).json({ title: "Error", message: error.message });
  }
});

// Render a single blog by ID
router.get("/:id", async (req, res) => {
  try {
    const blog = await getBlogById(req.params.id);
    if (!blog) {
      console.error("Blog not found");
      return res.redirect("/api/blogs");
    }
    res.render("blogs/blogDetail", {
      title: blog.title,
      blog,
      user: req.user,
    });
  } catch (error) {
    console.error("Error fetching blog details:", error.message);
    res.status(400).json({ title: "Error", message: error.message });
  }
});

// Create a new blog
router.post("/", authMiddleware, async (req, res) => {
  try {
    await createBlog(req.user.id, req.body);
    res.redirect("/api/blogs/my-blogs");
  } catch (error) {
    console.error("Error creating blog:", error.message);
    res.status(500).json({ title: "Error", message: error.message });
  }
});

// Render edit blog page
router.get("/:id/edit", authMiddleware, async (req, res) => {
  try {
    const blog = await getBlogById(req.params.id); // Populated author
    if (!blog) {
      console.error("Blog not found");
      return res.redirect("/api/blogs/my-blogs");
    }

    console.log("Blog Author:", blog.author);
    console.log("Authenticated User ID:", req.user._id);

    // Check if the logged-in user is the author
    if (blog.author._id.toString() !== req.user._id.toString()) {
      console.error("Unauthorized access to edit blog");
      return res.redirect("/api/blogs/my-blogs");
    }

    res.render("blogs/edit", { title: "Edit Blog", blog, user: req.user });
  } catch (error) {
    console.error("Error loading edit page:", error.message);
    res.redirect("/api/blogs/my-blogs");
  }
});



// Update a blog
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    await updateBlog(req.user.id, req.params.id, req.body);
    res.redirect("/api/blogs/my-blogs");
  } catch (error) {
    console.error("Error updating blog:", error.message);
    res.status(400).json({ error: true, message: error.message });
  }
});

// Delete a blog
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await deleteBlog(req.user.id, req.params.id);
    res.redirect("/api/blogs/my-blogs");
  } catch (error) {
    console.error("Error deleting blog:", error.message);
    res.status(400).json({ error: true, message: error.message });
  }
});

// Route to update blog state (draft -> published)
router.put("/:id/state", authMiddleware, async (req, res) => {
  try {
    const { state } = req.body;

    
    await updateBlogState(req.user.id, req.params.id, state);

    console.log(`Blog ${req.params.id} updated to state: ${state}`);
    res.redirect("/api/blogs/my-blogs");
  } catch (error) {
    console.error("Error updating blog state:", error.message);
    res.status(400).json({ error: true, message: error.message });
  }
});

module.exports = router;
