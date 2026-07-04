const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { createError, errorMessages } = require('../utils/errors');

// Register
router.post('/register', [
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('email').isEmail().toLowerCase().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['employee', 'hr', 'admin']).withMessage('Invalid role'),
  body('personalDetails.firstName').trim().notEmpty().withMessage('First name is required'),
  body('personalDetails.lastName').trim().notEmpty().withMessage('Last name is required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { employeeId, email, password, personalDetails, jobDetails } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ employeeId }, { email }] });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: errorMessages.EMPLOYEE_EXISTS 
      });
    }

    const user = new User({
      employeeId,
      email,
      password,
      role: 'employee',
      personalDetails,
      jobDetails,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        personalDetails: user.personalDetails
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false,
      message: errorMessages.INTERNAL_ERROR 
    });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().toLowerCase().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: errorMessages.INVALID_CREDENTIALS 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: errorMessages.INVALID_CREDENTIALS 
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        personalDetails: user.personalDetails,
        jobDetails: user.jobDetails,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: errorMessages.INTERNAL_ERROR 
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: errorMessages.USER_NOT_FOUND 
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        personalDetails: user.personalDetails,
        jobDetails: user.jobDetails,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false,
      message: errorMessages.INTERNAL_ERROR 
    });
  }
});

module.exports = router;
