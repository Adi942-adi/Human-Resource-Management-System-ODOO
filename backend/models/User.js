const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['employee', 'hr', 'admin'],
    default: 'employee'
  },
  personalDetails: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: String,
    address: String,
    phone: String,
    emergencyContact: String
  },
  jobDetails: {
    department: String,
    designation: String,
    joinDate: Date,
    employmentType: String,
    reportingManager: String
  },
  salaryStructure: {
    basicSalary: Number,
    hra: Number,
    da: Number,
    otherAllowances: Number,
    totalSalary: Number
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  profilePicture: String,
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();

  if (this.salaryStructure) {
    const basicSalary = this.salaryStructure.basicSalary || 0;
    const hra = this.salaryStructure.hra || 0;
    const da = this.salaryStructure.da || 0;
    const otherAllowances = this.salaryStructure.otherAllowances || 0;
    this.salaryStructure.totalSalary = basicSalary + hra + da + otherAllowances;
  }

  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
