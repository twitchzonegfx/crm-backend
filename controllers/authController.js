// controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Create JWT token with fallback for missing env variables
const createToken = (id) => {
  const secret = process.env.JWT_SECRET || 'your_fallback_secret_key';
  const expiry = process.env.JWT_EXPIRE || '30d';
  
  console.log(`Creating token with secret: ${secret.substring(0, 3)}... and expiry: ${expiry}`);
  
  return jwt.sign({ id }, secret, {
    expiresIn: expiry
  });
};

// Send token in cookie
const sendTokenResponse = (user, statusCode, res) => {
  try {
    // Create token
    const token = createToken(user._id);

    const cookieExpiry = parseInt(process.env.JWT_COOKIE_EXPIRE || 30);
    const options = {
      expires: new Date(Date.now() + cookieExpiry * 24 * 60 * 60 * 1000),
      httpOnly: true
    };

    // Make cookie secure in production
    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }

    console.log(`Sending token response for user: ${user.name}, token start: ${token.substring(0, 10)}...`);

    res
      .status(statusCode)
      .cookie('token', token, options)
      .json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
  } catch (err) {
    console.error('Error in sendTokenResponse:', err);
    res.status(500).json({
      success: false,
      message: 'Error generating authentication token'
    });
  }
};

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log('Register endpoint hit with data:', req.body);
    
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    console.log(`User created: ${user.name}, ID: ${user._id}`);
    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    console.log('Login endpoint hit with data:', req.body);
    
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log(`Login failed: No user found with email ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.log(`Login failed: Password does not match for user ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log(`User logged in: ${user.name}, ID: ${user._id}`);
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    console.log('GetMe endpoint hit for user ID:', req.user?.id);
    
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  console.log('Logout endpoint hit');
  
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};