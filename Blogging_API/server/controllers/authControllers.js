const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).render('auth/register', { error: 'All fields are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).render('auth/register', { error: 'User already exists. Please log in.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.redirect('/api/auth/login');
    } else {
      res.status(500).render('auth/register', { error: 'Failed to register. Please try again.' });
    }
  } catch (error) {
    res.status(500).render('auth/register', { error: 'An error occurred. Please try again later.' });
  }
};

// Log in an existing user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`Login failed: User not found with email: ${email}`);
      return res.status(401).render("auth/login", {
        title: "Login",
        error: "Invalid email or password",
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.error(`Login failed: Invalid password for email: ${email}`);
      return res.status(401).render("auth/login", {
        title: "Login",
        error: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "Strict", 
    });

    console.log(`User logged in successfully: ${user.email}`);
    return res.redirect("/api/blogs");
  } catch (error) {
    console.error(`Error during login: ${error.message}`);
    return res.status(500).render("auth/login", {
      title: "Login",
      error: "An unexpected error occurred. Please try again.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
