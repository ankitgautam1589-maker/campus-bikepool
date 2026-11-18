const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to sign JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, studentId, password, phoneNumber, department, bikeDetails } = req.body;

    if (!name || !email || !studentId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, university email, student ID, and password.',
      });
    }

    // Domain validation check for university student verification
    const eduDomainRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.)?edu(\.[a-zA-Z]{2,})?$/i;
    if (!eduDomainRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Registration requires a valid university student email ending in .edu',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { studentId: studentId.trim() }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A student with this email address or Student ID is already registered.',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      studentId,
      password,
      phoneNumber,
      department,
      bikeDetails,
      isVerifiedStudent: true,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
        avatar: user.avatar,
        isVerifiedStudent: user.isVerifiedStudent,
        rating: user.rating,
        bikeDetails: user.bikeDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate student & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Find user by email and explicitly select password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found for this email. Please click "Create Account" tab to register first.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify your password and try again.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
        avatar: user.avatar,
        isVerifiedStudent: user.isVerifiedStudent,
        rating: user.rating,
        bikeDetails: user.bikeDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in student profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
