const express = require('express');
const { registerUser, loginUser, logoutUser } = require('../controllers/authControllers'); // Corrected path
const authMiddleware = require('../middlewares/authMiddlewares');

const router = express.Router();

// Routes
router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Register - Blogging API' });
});

router.post('/register', registerUser);

router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login - Blogging API' });
});

router.post('/login', loginUser);


module.exports = router;
