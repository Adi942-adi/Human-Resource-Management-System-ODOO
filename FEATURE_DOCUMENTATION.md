# HRMS Feature Documentation

## Overview
The Human Resource Management System (HRMS) is a comprehensive web application for managing employee data, attendance, leave, and payroll.

## Features

### 1. User Authentication & Authorization
- Secure login and registration
- JWT-based authentication
- Role-based access control (Admin, HR Officer, Employee)
- Password hashing with bcrypt

### 2. Dashboard
- Role-specific dashboards
- Quick access to all modules
- Real-time statistics
- Recent activity feed

### 3. Employee Management
- Complete employee profile management
- Personal details, job details, salary structure
- Document management
- Profile picture support
- Search and filter employees

### 4. Attendance Management
- Daily check-in/check-out
- Work hours calculation
- Attendance status tracking
- Calendar view for attendance history
- Daily, weekly, and monthly reports
- Admin/HR can update attendance records

### 5. Leave Management
- Leave application with date selection
- Multiple leave types (Paid, Sick, Unpaid)
- Leave approval workflow
- Leave balance tracking
- Leave history and status tracking
- Cancel pending requests

### 6. Payroll Management
- Automated payroll processing
- Salary structure management (Basic, HRA, DA, Allowances)
- Deductions handling
- Attendance-based payroll calculation
- Payslip generation
- Payroll status tracking (Pending, Processed, Paid)
- Year-to-date payroll summaries

## User Roles & Permissions

### Employee
- View and edit own profile (limited fields)
- Check in/out attendance
- View own attendance history
- Apply for leave
- View own leave status and history
- View own payroll and download payslips

### HR Officer
- All employee features
- View and manage all employee profiles
- View all attendance records
- Approve/reject leave requests
- Create and manage payroll
- Process payroll and mark as paid

### Admin
- All HR Officer features
- Delete payroll records
- Delete user accounts
- Full system management

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- express-validator
- helmet
- express-rate-limit

### Frontend
- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Lucide React icons
