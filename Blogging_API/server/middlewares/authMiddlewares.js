const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");

const publicRoutes = ["/", "/api/auth/login", "/api/auth/register"];

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    // Allow public routes without a token. this was specified in the question we were given that both sign in and not sign in should have access to the published blo
    if (!token && publicRoutes.includes(req.path)) {
      console.log("Public route - No token required");
      return next();
    }

    // Redirect unauthenticated users from protected routes
    if (!token) {
      console.log("No token found - Redirecting to login");
      return res.redirect("/api/auth/login");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log("No user found - Redirecting to login");
      return res.redirect("/api/auth/login");
    }

    // Attach user to request
    req.user = user;
    console.log("Authenticated User in Middleware:", req.user);
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.redirect("/api/auth/login");
  }
};

module.exports = authMiddleware;
