const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const validateRequest = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
    return false;
  }
  return true;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ensureValidId = (id, res, label = 'Resource') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({
      success: false,
      message: `${label} ID is invalid`,
    });
    return false;
  }
  return true;
};

const createUserValidators = [
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('email').isEmail().toLowerCase().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['employee', 'hr', 'admin']).withMessage('Invalid role'),
  body('personalDetails.firstName').trim().notEmpty().withMessage('First name is required'),
  body('personalDetails.lastName').trim().notEmpty().withMessage('Last name is required'),
  body('salaryStructure.basicSalary').optional({ nullable: true, checkFalsy: true }).isNumeric().withMessage('Basic salary must be numeric'),
  body('salaryStructure.hra').optional({ nullable: true, checkFalsy: true }).isNumeric().withMessage('HRA must be numeric'),
  body('salaryStructure.da').optional({ nullable: true, checkFalsy: true }).isNumeric().withMessage('DA must be numeric'),
  body('salaryStructure.otherAllowances').optional({ nullable: true, checkFalsy: true }).isNumeric().withMessage('Other allowances must be numeric'),
];

const assignDefined = (document, path, value) => {
  if (value !== undefined) {
    document.set(path, value);
  }
};

const buildManagedUserUpdates = (req, targetUser) => {
  const { email, role, personalDetails = {}, jobDetails = {}, salaryStructure = {}, profilePicture } = req.body;

  if (email !== undefined) {
    targetUser.email = email;
  }

  if (role !== undefined) {
    targetUser.role = role;
  }

  [
    'firstName',
    'lastName',
    'dateOfBirth',
    'gender',
    'address',
    'phone',
    'emergencyContact',
  ].forEach((field) => assignDefined(targetUser, `personalDetails.${field}`, personalDetails[field]));

  [
    'department',
    'designation',
    'joinDate',
    'employmentType',
    'reportingManager',
  ].forEach((field) => assignDefined(targetUser, `jobDetails.${field}`, jobDetails[field]));

  [
    'basicSalary',
    'hra',
    'da',
    'otherAllowances',
    'totalSalary',
  ].forEach((field) => assignDefined(targetUser, `salaryStructure.${field}`, salaryStructure[field]));

  assignDefined(targetUser, 'profilePicture', profilePicture);
};

router.get('/', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { role, search, department } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (department) {
      query['jobDetails.department'] = department;
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      query.$or = [
        { employeeId: regex },
        { email: regex },
        { 'personalDetails.firstName': regex },
        { 'personalDetails.lastName': regex },
        { 'jobDetails.department': regex },
        { 'jobDetails.designation': regex },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.post('/', auth, authorize('admin', 'hr'), createUserValidators, async (req, res) => {
  try {
    if (!validateRequest(req, res)) return;

    const { employeeId, email, password, role = 'employee', personalDetails, jobDetails, salaryStructure } = req.body;

    if (req.user.role === 'hr' && role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'HR officers can only create employee accounts',
      });
    }

    const existingUser = await User.findOne({ $or: [{ employeeId }, { email }] });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Employee ID or email already exists',
      });
    }

    const user = await User.create({
      employeeId,
      email,
      password,
      role,
      personalDetails,
      jobDetails,
      salaryStructure,
    });

    const safeUser = await User.findById(user._id).select('-password');
    res.status(201).json(safeUser);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    if (!ensureValidId(req.params.id, res, 'User')) return;

    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user.role === 'employee' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this profile' });
    }

    if (req.user.role === 'hr' && user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this profile' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, [
  body('email').optional().isEmail().toLowerCase().withMessage('Valid email is required'),
  body('role').optional().isIn(['employee', 'hr', 'admin']).withMessage('Invalid role'),
], async (req, res) => {
  try {
    if (!validateRequest(req, res)) return;
    if (!ensureValidId(req.params.id, res, 'User')) return;

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user.role === 'employee') {
      if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this profile' });
      }

      const personalDetails = req.body.personalDetails || {};
      assignDefined(user, 'personalDetails.address', personalDetails.address);
      assignDefined(user, 'personalDetails.phone', personalDetails.phone);
      assignDefined(user, 'profilePicture', req.body.profilePicture);
    } else {
      if (req.user.role === 'hr' && (user.role === 'admin' || req.body.role === 'admin' || req.body.role === 'hr')) {
        return res.status(403).json({
          success: false,
          message: 'HR officers can only manage employee accounts',
        });
      }

      buildManagedUserUpdates(req, user);
    }

    user.updatedAt = Date.now();
    await user.save();

    const safeUser = await User.findById(user._id).select('-password');
    res.json(safeUser);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Employee ID or email already exists',
      });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    if (!ensureValidId(req.params.id, res, 'User')) return;

    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Admins cannot delete their own account',
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
