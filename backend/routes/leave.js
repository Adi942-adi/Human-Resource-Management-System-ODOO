const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Leave = require('../models/Leave');
const { auth, authorize } = require('../middleware/auth');
const { differenceInCalendarDays, startOfDay, endOfDay } = require('date-fns');

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

// Apply for leave
router.post('/apply', auth, [
  body('leaveType').isIn(['paid', 'sick', 'unpaid']).withMessage('Invalid leave type'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date'),
  body('reason').notEmpty().withMessage('Reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { leaveType, startDate, endDate, reason, remarks } = req.body;

    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));
    
    if (start > end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const overlappingLeave = await Leave.findOne({
      employee: req.user._id,
      status: { $in: ['pending', 'approved'] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (overlappingLeave) {
      return res.status(409).json({ message: 'A pending or approved leave already overlaps this date range' });
    }

    const totalDays = differenceInCalendarDays(end, start) + 1;

    const leave = new Leave({
      employee: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
      remarks
    });

    await leave.save();
    await leave.populate('employee', 'employeeId personalDetails.firstName personalDetails.lastName');

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get my leave requests
router.get('/my', auth, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { employee: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const leaves = await Leave.find(query)
      .populate('employee', 'employeeId personalDetails.firstName personalDetails.lastName')
      .sort({ createdAt: -1 });
    
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all leave requests (Admin/HR)
router.get('/', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { status, employeeId } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }

    if (employeeId) {
      query.employee = employeeId;
    }

    const leaves = await Leave.find(query)
      .populate('employee', 'employeeId personalDetails.firstName personalDetails.lastName')
      .populate('approvedBy', 'employeeId personalDetails.firstName personalDetails.lastName')
      .sort({ createdAt: -1 });
    
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve leave (Admin/HR)
router.put('/:id/approve', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    if (!ensureValidId(req.params.id, res, 'Leave request')) return;

    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Leave request has already been processed' });
    }

    leave.status = 'approved';
    leave.approvedBy = req.user._id;
    leave.approvedAt = new Date();
    leave.updatedAt = Date.now();

    await leave.save();
    await leave.populate('employee', 'employeeId personalDetails.firstName personalDetails.lastName');
    await leave.populate('approvedBy', 'employeeId personalDetails.firstName personalDetails.lastName');

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject leave (Admin/HR)
router.put('/:id/reject', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    if (!ensureValidId(req.params.id, res, 'Leave request')) return;

    const { rejectionReason } = req.body;
    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Leave request has already been processed' });
    }

    leave.status = 'rejected';
    leave.approvedBy = req.user._id;
    leave.approvedAt = new Date();
    leave.rejectionReason = rejectionReason;
    leave.updatedAt = Date.now();

    await leave.save();
    await leave.populate('employee', 'employeeId personalDetails.firstName personalDetails.lastName');
    await leave.populate('approvedBy', 'employeeId personalDetails.firstName personalDetails.lastName');

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel leave request (Employee only)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    if (!ensureValidId(req.params.id, res, 'Leave request')) return;

    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leave.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this leave request' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending leave requests' });
    }

    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave request cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
