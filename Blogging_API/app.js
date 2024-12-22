const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const authRoutes = require('./server/routes/authRoutes');
const blogRoutes = require('./server/routes/blogRoutes');
const authMiddleware = require('./server/middlewares/authMiddlewares');
const { getBlogs } = require('./server/controllers/blogControllers');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client/public')));
app.use(methodOverride('_method'));

// Apply authMiddleware globally to set req.user
app.use(authMiddleware);

// Middleware to pass user and title to views
app.use((req, res, next) => {
  res.locals.user = req.user || null; 
  res.locals.title = 'Blogging API';
  next();
});

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'client/views/blogs'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// Homepage Route
app.get('/', async (req, res) => {
  try {
    const blogs = await getBlogs({ state: 'published' }); 
    res.render('index', { title: 'Home - Blogging API', blogs });
  } catch (error) {
    console.error('Error loading blogs:', error.message);
    res.status(500).send(`
      <h1>500 - Internal Server Error</h1>
      <p>Failed to load blogs. Please try again later.</p>
    `); 
  }
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send(`
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
  `); 
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.message);
  res.status(err.status || 500).send(`
    <h1>500 - Internal Server Error</h1>
    <p>${err.message || "An unexpected error occurred."}</p>
  `); 
});

module.exports = app;
