const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { Resend } = require('resend');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Initialize Resend email service
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Helper function to verify Google token and extract user info
async function verifyGoogleToken(token) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID
    });
    return ticket.getPayload();
  } catch (error) {
    throw new Error('Invalid Google token');
  }
}

/**
 * POST /api/auth/register
 * Register new user (passenger or staff)
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, role = 'passenger' } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      role,
      name: email.split('@')[0]
    });

    // Save user to database
    const savedUser = await user.save();

    // Verify user was saved with _id
    if (!savedUser._id) {
      throw new Error('User creation failed - no ID returned');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: savedUser._id, email: savedUser.email, role: savedUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success with complete user data
    res.json({ 
      message: 'User registered successfully',
      token,
      user: {
        _id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        name: savedUser.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

/**
 * POST /api/auth/login
 * User login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user in database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
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

/**
 * POST /api/auth/google-register
 * Register user with Google OAuth
 */
router.post('/google-register', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    // Verify Google token and get user info
    const payload = await verifyGoogleToken(token);
    const { email, name, picture } = payload;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // User already exists, just generate token and return
      const jwtToken = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Google registration successful',
        token: jwtToken,
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
          profilePicture: user.profilePicture
        }
      });
    }

    // Create new user with Google OAuth data
    user = new User({
      email,
      name: name || email.split('@')[0],
      profilePicture: picture,
      role: 'passenger',
      password: bcrypt.hashSync(Math.random().toString(36).substring(7), 10), // Random password for OAuth users
      otpVerified: true
    });

    const savedUser = await user.save();

    if (!savedUser._id) {
      throw new Error('User creation failed - no ID returned');
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: savedUser._id, email: savedUser.email, role: savedUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Google registration successful',
      token: jwtToken,
      user: {
        _id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        name: savedUser.name,
        profilePicture: savedUser.profilePicture
      }
    });
  } catch (error) {
    console.error('Google registration error:', error);
    res.status(500).json({ message: 'Google registration failed', error: error.message });
  }
});

/**
 * POST /api/auth/google-login
 * Login user with Google OAuth
 */
router.post('/google-login', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    // Verify Google token and get user info
    const payload = await verifyGoogleToken(token);
    const { email, name, picture } = payload;

    // Find user by email
    let user = await User.findOne({ email });

    if (!user) {
      // Auto-create user if they don't exist (for seamless OAuth experience)
      user = new User({
        email,
        name: name || email.split('@')[0],
        profilePicture: picture,
        role: 'passenger',
        password: bcrypt.hashSync(Math.random().toString(36).substring(7), 10),
        otpVerified: true
      });

      await user.save();
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Google login successful',
      token: jwtToken,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Google login failed', error: error.message });
  }
});

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return res.json({
        message: 'If an account exists with this email, a reset link has been sent'
      });
    }

    // Generate password reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET + 'reset',
      { expiresIn: '1h' }
    );

    // Save reset token to database with expiration
    user.resetToken = resetToken;
    user.resetTokenExpire = new Date(Date.now() + 3600000); // 1 hour from now
    await user.save();

    // Send email with reset link if Resend API key is configured
    if (resend) {
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      try {
        const emailResponse = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'noreply@baggagelens.com',
          to: email,
          subject: 'Password Reset - BaggageLens',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background-color: #1a3a52; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                  .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
                  .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                  .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>BaggageLens</h1>
                    <p>Password Reset Request</p>
                  </div>
                  <div class="content">
                    <p>Hello ${user.name || 'User'},</p>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    <a href="${resetLink}" class="button">Reset Password</a>
                    <p><strong>Important:</strong> This link will expire in 1 hour.</p>
                    <p>If you didn't request this password reset, you can ignore this email. Your password will remain unchanged.</p>
                    <p>For security reasons, never share this link with anyone.</p>
                  </div>
                  <div class="footer">
                    <p>&copy; 2026 BaggageLens. All rights reserved.</p>
                    <p>If you have any questions, please contact our support team.</p>
                  </div>
                </div>
              </body>
            </html>
          `
        });
        
        console.log('📧 Attempting to send email...');
        console.log(`   API Key configured: ${process.env.RESEND_API_KEY ? '✓' : '✗'}`);
        console.log(`   From: ${process.env.RESEND_FROM_EMAIL}`);
        console.log(`   To: ${email}`);
        console.log('📨 Resend Response:', JSON.stringify(emailResponse, null, 2));
        
        if (emailResponse.id) {
          console.log(`✅ Email sent successfully! ID: ${emailResponse.id}`);
        } else if (emailResponse.error) {
          console.log(`⚠️  Email sent with warning:`, emailResponse.error);
        } else {
          console.log(`✅ Email sent successfully!`);
        }
      } catch (emailError) {
        console.error('❌ Error sending email:');
        console.error('   Error code:', emailError.code);
        console.error('   Error message:', emailError.message);
        console.error('   Full error:', JSON.stringify(emailError, null, 2));
        // Continue even if email fails - user can still use the token if they have it
      }
    } else {
      // If no Resend API key, log the token to console (development only)
      console.warn('⚠️ RESEND_API_KEY not configured. Reset token (for development):');
      console.log(`Reset link: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);
    }

    res.json({
      message: 'If an account exists with this email, a reset link has been sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process password reset', error: error.message });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset user password with valid reset token
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Verify and decode the reset token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET + 'reset');
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Find user and verify reset token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if reset token matches and hasn't expired
    if (user.resetToken !== token) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    if (!user.resetTokenExpire || new Date() > user.resetTokenExpire) {
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpire = null;
    await user.save();

    // Send confirmation email
    if (resend) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'noreply@baggagelens.com',
          to: user.email,
          subject: 'Password Changed Successfully - BaggageLens',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                  .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
                  .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>✓ Password Changed</h1>
                  </div>
                  <div class="content">
                    <p>Hello ${user.name || 'User'},</p>
                    <p>Your password has been successfully reset. You can now log in with your new password.</p>
                    <p>If you didn't make this change, please contact our support team immediately.</p>
                  </div>
                  <div class="footer">
                    <p>&copy; 2026 BaggageLens. All rights reserved.</p>
                  </div>
                </div>
              </body>
            </html>
          `
        });
        
        console.log(`Password confirmation email sent to ${user.email}`);
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }
    }

    res.json({
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
});

module.exports = router;
