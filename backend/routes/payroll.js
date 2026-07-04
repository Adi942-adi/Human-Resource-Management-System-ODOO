const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Payroll = require('../models/Payroll');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

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

const normalizeMonth = (month) => {
  if (month === undefined || month === null || month === '') return undefined;

  const numericMonth = Number(month);
  if (Number.isInteger(numericMonth) && numericMonth >= 1 && numericMonth <= 12) {
    return monthNames[numericMonth - 1];
  }

  const matchedMonth = monthNames.find((name) => name.toLowerCase() === String(month).toLowerCase());
  return matchedMonth;
};

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

const calculateNetSalary = (payload, existing = {}) => {
  const basicSalary = Number(payload.basicSalary ?? existing.basicSalary ?? 0);
  const hra = Number(payload.hra ?? existing.hra ?? 0);
  const da = Number(payload.da ?? existing.da ?? 0);
  const otherAllowances = Number(payload.otherAllowances ?? existing.otherAllowances ?? 0);
  const deductions = Number(payload.deductions ?? existing.deductions ?? 0);
  return basicSalary + hra + da + otherAllowances - deductions;
};

const payrollValidators = [
  body('employee').isMongoId().withMessage('Valid employee is required'),
  body('month').custom((value) => Boolean(normalizeMonth(value))).withMessage('Valid month is required'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('Valid year is required'),
  body('basicSalary').isFloat({ min: 0 }).withMessage('Basic salary is required'),
  body('hra').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('HRA must be positive'),
  body('da').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('DA must be positive'),
  body('otherAllowances').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Other allowances must be positive'),
  body('deductions').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Deductions must be positive'),
  body('paidDays').optional({ nullable: true }).isInt({ min: 0, max: 31 }).withMessage('Paid days must be between 0 and 31'),
  body('unpaidDays').optional({ nullable: true }).isInt({ min: 0, max: 31 }).withMessage('Unpaid days must be between 0 and 31'),
];

router.get('/my', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { employee: req.user._id };
    const normalizedMonth = normalizeMonth(month);

    if (month && !normalizedMonth) {
      return res.status(400).json({ success: false, message: 'Invalid month' });
    }

    if (normalizedMonth) {
      query.month = normalizedMonth;
    }

    if (year) {
      query.year = Number(year);
    }

    const payroll = await Payroll.find(query).sort({ year: -1, createdAt: -1 });
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.get('/', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { month, year, employeeId, status } = req.query;
    const query = {};
    const normalizedMonth = normalizeMonth(month);

    if (month && !normalizedMonth) {
      return res.status(400).json({ success: false, message: 'Invalid month' });
    }

    if (normalizedMonth) {
      query.month = normalizedMonth;
    }

    if (year) {
      query.year = Number(year);
    }

    if (employeeId) {
      if (!ensureValidId(employeeId, res, 'Employee')) return;
      query.employee = employeeId;
    }

    if (status) {
      query.status = status;
    }

    const payroll = await Payroll.find(query)
      .populate('employee', 'employeeId email personalDetails.firstName personalDetails.lastName')
      .populate('processedBy', 'employeeId personalDetails.firstName personalDetails.lastName')
      .sort({ year: -1, createdAt: -1 });
    
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.post('/', auth, authorize('admin', 'hr'), payrollValidators, async (req, res) => {
  try {
    if (!validateRequest(req, res)) return;

    const employee = await User.findById(req.body.employee).select('_id role');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const payroll = new Payroll({
      ...req.body,
      month: normalizeMonth(req.body.month),
      year: Number(req.body.year),
      netSalary: calculateNetSalary(req.body),
    });

    await payroll.save();
    await payroll.populate('employee', 'employeeId email personalDetails.firstName personalDetails.lastName');

    res.status(201).json(payroll);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Payroll already exists for this employee and month',
      });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, authorize('admin', 'hr'), [
  body('month').optional().custom((value) => Boolean(normalizeMonth(value))).withMessage('Valid month is required'),
  body('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('Valid year is required'),
  body('basicSalary').optional().isFloat({ min: 0 }).withMessage('Basic salary must be positive'),
  body('hra').optional().isFloat({ min: 0 }).withMessage('HRA must be positive'),
  body('da').optional().isFloat({ min: 0 }).withMessage('DA must be positive'),
  body('otherAllowances').optional().isFloat({ min: 0 }).withMessage('Other allowances must be positive'),
  body('deductions').optional().isFloat({ min: 0 }).withMessage('Deductions must be positive'),
  body('paidDays').optional().isInt({ min: 0, max: 31 }).withMessage('Paid days must be between 0 and 31'),
  body('unpaidDays').optional().isInt({ min: 0, max: 31 }).withMessage('Unpaid days must be between 0 and 31'),
], async (req, res) => {
  try {
    if (!validateRequest(req, res)) return;
    if (!ensureValidId(req.params.id, res, 'Payroll')) return;

    const payroll = await Payroll.findById(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    [
      'basicSalary',
      'hra',
      'da',
      'otherAllowances',
      'deductions',
      'paidDays',
      'unpaidDays',
    ].forEach((field) => {
      if (req.body[field] !== undefined) {
        payroll[field] = req.body[field];
      }
    });

    if (req.body.month !== undefined) {
      payroll.month = normalizeMonth(req.body.month);
    }

    if (req.body.year !== undefined) {
      payroll.year = Number(req.body.year);
    }

    payroll.netSalary = calculateNetSalary(req.body, payroll);
    payroll.updatedAt = Date.now();
    await payroll.save();

    await payroll.populate('employee', 'employeeId email personalDetails.firstName personalDetails.lastName');
    await payroll.populate('processedBy', 'employeeId personalDetails.firstName personalDetails.lastName');

    res.json(payroll);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Payroll already exists for this employee and month',
      });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.put('/:id/process', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    if (!ensureValidId(req.params.id, res, 'Payroll')) return;

    const payroll = await Payroll.findById(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    if (payroll.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Payroll has already been processed' });
    }

    payroll.status = 'processed';
    payroll.processedBy = req.user._id;
    payroll.processedAt = new Date();
    payroll.updatedAt = Date.now();

    await payroll.save();
    await payroll.populate('employee', 'employeeId email personalDetails.firstName personalDetails.lastName');
    await payroll.populate('processedBy', 'employeeId personalDetails.firstName personalDetails.lastName');

    res.json(payroll);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.put('/:id/pay', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    if (!ensureValidId(req.params.id, res, 'Payroll')) return;

    const payroll = await Payroll.findById(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    if (payroll.status !== 'processed') {
      return res.status(400).json({ success: false, message: 'Payroll must be processed before marking as paid' });
    }

    payroll.status = 'paid';
    payroll.updatedAt = Date.now();

    await payroll.save();
    await payroll.populate('employee', 'employeeId email personalDetails.firstName personalDetails.lastName');
    await payroll.populate('processedBy', 'employeeId personalDetails.firstName personalDetails.lastName');

    res.json(payroll);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    if (!ensureValidId(req.params.id, res, 'Payroll')) return;

    const payroll = await Payroll.findById(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    await Payroll.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Payroll record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
