const express = require('express');
const router = express.Router();

/**
 * POST /api/auth/register
 * Register new user (passenger or staff)
 */
router.post('/register', (req, res) => {
  // TODO: Implement user registration
  res.json({ message: 'Register endpoint' });
});

/**
 * POST /api/auth/login
 * User login with email and password
 */
router.post('/login', (req, res) => {
  // TODO: Implement user login
  res.json({ message: 'Login endpoint' });
});

/**
 * POST /api/auth/otp/send
 * Send OTP to user phone
 */
router.post('/otp/send', (req, res) => {
  // TODO: Implement OTP sending
  res.json({ message: 'OTP send endpoint' });
});

/**
 * POST /api/auth/otp/verify
 * Verify OTP
 */
router.post('/otp/verify', (req, res) => {
  // TODO: Implement OTP verification
  res.json({ message: 'OTP verify endpoint' });
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', (req, res) => {
  // TODO: Implement token refresh
  res.json({ message: 'Refresh token endpoint' });
});

/**
 * POST /api/auth/logout
 * User logout
 */
router.post('/logout', (req, res) => {
  // TODO: Implement logout
  res.json({ message: 'Logout endpoint' });
});

module.exports = router;
