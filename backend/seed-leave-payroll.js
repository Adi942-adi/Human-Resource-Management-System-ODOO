
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('./models/User');
const Leave = require('./models/Leave');
const Payroll = require('./models/Payroll');

async function connect() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

async function seed() {
  try {
    await connect();
    console.log('Connected to DB for seeding');

    // Get the employee
    const employee = await User.findOne({ email: 'employee@example.com' });
    if (!employee) {
      console.log('Employee not found');
      await mongoose.disconnect();
      process.exit(1);
    }
    console.log('Found employee:', employee.email);

    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Create a leave request
    try {
      await Leave.create({
        employee: employee._id,
        leaveType: 'paid',
        startDate: new Date(dateOnly.getTime() + 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(dateOnly.getTime() + 4 * 24 * 60 * 60 * 1000),
        totalDays: 3,
        reason: 'Personal',
        status: 'pending'
      });
      console.log('Created leave for', employee.email);
    } catch (err) {
      console.log('Leave create failed or exists:', err.message);
    }

    // Create payroll for current month
    try {
      const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      const m = today.getMonth();
      const y = today.getFullYear();
      const basic = 5000;
      const hra = 500;
      const da = 200;
      const other = 100;
      const deductions = 150;
      const net = basic + hra + da + other - deductions;

      await Payroll.create({
        employee: employee._id,
        month: monthNames[m],
        year: y,
        basicSalary: basic,
        hra,
        da,
        otherAllowances: other,
        deductions,
        netSalary: net,
        paidDays: 22,
        unpaidDays: 0,
        status: 'processed'
      });
      console.log('Created payroll for', employee.email);
    } catch (err) {
      console.log('Payroll create failed or exists:', err.message);
    }

    console.log('Seeding complete');
  } catch (err) {
    console.error('Seeding error', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
