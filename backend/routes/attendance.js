const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const { auth, authorize } = require('../middleware/auth');
const { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } = require('date-fns');

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

// Check in
router.post('/checkin', auth, async (req, res) => {
  console.log('[DEBUG] Check-in request received for user:', req.user._id);
  try {
    const today = startOfDay(new Date());
    console.log('[DEBUG] Today:', today);
    
    const existingAttendance = await Attendance.findOne({
      employee: req.user._id,
      date: today
    });
    
    console.log('[DEBUG] Existing attendance:', existingAttendance);

    if (existingAttendance && existingAttendance.checkIn) {
      console.log('[DEBUG] Already checked in');
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const attendance = existingAttendance || new Attendance({
      employee: req.user._id,
      date: today
    });

    attendance.checkIn = new Date();
    attendance.status = 'present';
    await attendance.save();
    
    console.log('[DEBUG] Check-in successful, attendance saved:', attendance);
    res.json(attendance);
  } catch (error) {
    console.error('[ERROR] Check-in failed:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check out
router.post('/checkout', auth, async (req, res) => {
  console.log('[DEBUG] Check-out request received for user:', req.user._id);
  try {
    const today = startOfDay(new Date());
    console.log('[DEBUG] Today:', today);
    
    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: today
    });
    
    console.log('[DEBUG] Attendance for check-out:', attendance);

    if (!attendance || !attendance.checkIn) {
      console.log('[DEBUG] No check-in found');
      return res.status(400).json({ message: 'No check-in record found for today' });
    }

    if (attendance.checkOut) {
      console.log('[DEBUG] Already checked out');
      return res.status(400).json({ message: 'Already checked out today' });
    }

    attendance.checkOut = new Date();
    
    // Calculate work hours
    const checkInTime = new Date(attendance.checkIn);
    const checkOutTime = new Date(attendance.checkOut);
    const workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    attendance.workHours = Math.round(workHours * 100) / 100;

    await attendance.save();
    
    console.log('[DEBUG] Check-out successful, attendance saved:', attendance);
    res.json(attendance);
  } catch (error) {
    console.error('[ERROR] Check-out failed:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get my attendance
router.get('/my', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { employee: req.user._id };
    
    if (startDate && endDate) {
      query.date = {
        $gte: startOfDay(new Date(startDate)),
        $lte: endOfDay(new Date(endDate))
      };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance by date range (Admin/HR)
router.get('/range', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    
    let query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: startOfDay(new Date(startDate)),
        $lte: endOfDay(new Date(endDate))
      };
    }

    if (employeeId) {
      query.employee = employeeId;
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'employeeId personalDetails.firstName personalDetails.lastName')
      .sort({ date: -1 });
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get daily attendance
router.get('/daily/:date', auth, async (req, res) => {
  try {
    const date = startOfDay(new Date(req.params.date));
    
    let query = { date };
    
    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'employeeId personalDetails.firstName personalDetails.lastName');
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get weekly attendance
router.get('/weekly/:date', auth, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    
    let query = {
      date: {
        $gte: weekStart,
        $lte: weekEnd
      }
    };
    
    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'employeeId personalDetails.firstName personalDetails.lastName')
      .sort({ date: 1 });
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get monthly attendance
router.get('/monthly/:year/:month', auth, async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month) - 1; // JavaScript months are 0-indexed
    
    const monthStart = startOfMonth(new Date(year, month));
    const monthEnd = endOfMonth(new Date(year, month));
    
    let query = {
      date: {
        $gte: monthStart,
        $lte: monthEnd
      }
    };
    
    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'employeeId personalDetails.firstName personalDetails.lastName')
      .sort({ date: 1 });
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update attendance (Admin/HR only)
router.put('/:id', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    if (!ensureValidId(req.params.id, res, 'Attendance')) return;

    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    ['checkIn', 'checkOut', 'status', 'workHours', 'notes'].forEach((field) => {
      if (req.body[field] !== undefined) {
        attendance[field] = req.body[field];
      }
    });

    if (attendance.checkIn && attendance.checkOut && req.body.workHours === undefined) {
      const workHours = (new Date(attendance.checkOut) - new Date(attendance.checkIn)) / (1000 * 60 * 60);
      attendance.workHours = Math.max(0, Math.round(workHours * 100) / 100);
    }

    attendance.updatedAt = Date.now();
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
