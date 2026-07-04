# Human Resource Management System (HRMS)

A comprehensive HRMS built with React, Node.js, and MongoDB to streamline HR operations including employee management, attendance tracking, leave management, and payroll processing.

## Features

### Authentication & Authorization
- Secure user registration with email validation
- Role-based access control (Admin, HR Officer, Employee)
- JWT-based authentication
- Password hashing with bcrypt

### Employee Management
- Complete employee profile management
- Personal details, job details, and salary structure
- Document management
- Profile picture support
- Role-based edit permissions

### Attendance Management
- Daily check-in/check-out functionality
- Work hours calculation
- Attendance status tracking (Present, Absent, Half-day, Leave)
- Calendar view for attendance history
- Daily, weekly, and monthly attendance reports
- Real-time attendance updates

### Leave Management
- Leave application with calendar date selection
- Multiple leave types (Paid, Sick, Unpaid)
- Leave approval workflow for Admin/HR
- Leave balance tracking
- Leave history and status tracking
- Cancellation of pending requests

### Payroll Management
- Automated payroll processing
- Salary structure management (Basic, HRA, DA, Allowances)
- Deductions handling
- Attendance-based payroll calculation
- Payslip generation and download
- Payroll status tracking (Pending, Processed, Paid)
- Year-to-date payroll summaries

### Dashboard
- Role-specific dashboards (Employee vs Admin/HR)
- Quick access cards for all features
- Real-time statistics and metrics
- Recent activity feeds
- Pending leave request approvals

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **cors** - Cross-origin resource sharing
- **express-validator** - Input validation
- **date-fns** - Date manipulation

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Calendar** - Calendar component
- **date-fns** - Date manipulation

## Project Structure

```
hrms/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Attendance.js
│   │   ├── Leave.js
│   │   └── Payroll.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── attendance.js
│   │   ├── leave.js
│   │   └── payroll.js
│   ├── middleware/
│   │   └── auth.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── EmployeeDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Attendance.jsx
│   │   │   ├── Leave.jsx
│   │   │   └── Payroll.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the backend directory with the following:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hrms
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

4. Start MongoDB:
```bash
# On Windows
net start MongoDB

# On Linux/Mac
sudo systemctl start mongod
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

### First Time Setup

1. **Register an Admin User:**
   - Go to `http://localhost:3000/register`
   - Fill in the registration form
   - Select "Admin" as the role
   - Submit the form

2. **Register HR Officers and Employees:**
   - Use the Admin account to register other users
   - Or register directly with appropriate roles

### Employee Features

- **Dashboard:** View personal statistics and quick access to features
- **Profile:** View and edit personal information (limited fields)
- **Attendance:** Check in/out, view attendance history, calendar view
- **Leave:** Apply for leave, view leave status, cancel pending requests
- **Payroll:** View salary details, download payslips

### Admin/HR Features

- **Dashboard:** View organization statistics, approve pending leaves
- **Employee Management:** View all employees, edit employee details
- **Attendance Management:** View all attendance records, update attendance
- **Leave Management:** Approve/reject leave requests, view all leave history
- **Payroll Management:** Create, update, process payroll, mark as paid

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (Admin/HR only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

### Attendance
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/my` - Get my attendance
- `GET /api/attendance/range` - Get attendance by date range (Admin/HR)
- `GET /api/attendance/daily/:date` - Get daily attendance
- `GET /api/attendance/weekly/:date` - Get weekly attendance
- `GET /api/attendance/monthly/:year/:month` - Get monthly attendance
- `PUT /api/attendance/:id` - Update attendance (Admin/HR)

### Leave
- `POST /api/leave/apply` - Apply for leave
- `GET /api/leave/my` - Get my leave requests
- `GET /api/leave` - Get all leave requests (Admin/HR)
- `PUT /api/leave/:id/approve` - Approve leave (Admin/HR)
- `PUT /api/leave/:id/reject` - Reject leave (Admin/HR)
- `PUT /api/leave/:id/cancel` - Cancel leave request

### Payroll
- `GET /api/payroll/my` - Get my payroll
- `GET /api/payroll` - Get all payroll (Admin/HR)
- `POST /api/payroll` - Create payroll (Admin/HR)
- `PUT /api/payroll/:id` - Update payroll (Admin/HR)
- `PUT /api/payroll/:id/process` - Process payroll (Admin/HR)
- `PUT /api/payroll/:id/pay` - Mark as paid (Admin/HR)
- `DELETE /api/payroll/:id` - Delete payroll (Admin only)

## User Roles

### Employee
- View and edit limited profile fields
- Check in/out attendance
- View attendance history
- Apply for leave
- View leave status
- View payroll details
- Download payslips

### HR Officer
- All employee features
- View all employee profiles
- View all attendance records
- Approve/reject leave requests
- Create and manage payroll
- Process and mark payroll as paid

### Admin
- All HR Officer features
- Delete payroll records
- Full system management

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- Input validation
- CORS protection
- Secure API endpoints

## Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

Backend:
```bash
cd backend
npm start
```

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check the MONGODB_URI in .env file
- Verify MongoDB is accessible on the specified port

### CORS Errors
- Ensure backend CORS is configured correctly
- Check frontend API proxy configuration in vite.config.js

### Authentication Issues
- Verify JWT_SECRET is set in .env
- Check token expiration (default: 7 days)
- Ensure tokens are sent in Authorization header

## Future Enhancements

- Email verification for registration
- Password reset functionality
- Document upload/download
- Advanced reporting and analytics
- Mobile app version
- Integration with payment gateways
- Biometric attendance
- Performance reviews module
- Training management
- Employee onboarding workflow

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please contact the development team.
