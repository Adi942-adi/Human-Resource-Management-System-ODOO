# HRMS API Documentation

## Base URL
`http://localhost:5001/api`

## Authentication
Most endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

---

## 1. Authentication Endpoints

### Register a new user
- **POST** `/auth/register`
- **Request Body**:
  ```json
  {
    "employeeId": "EMP001",
    "email": "user@example.com",
    "password": "password123",
    "personalDetails": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "<jwt-token>",
    "user": { ... }
  }
  ```

### Login
- **POST** `/auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "<jwt-token>",
    "user": { ... }
  }
  ```

### Get current user
- **GET** `/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "success": true,
    "user": { ... }
  }
  ```

---

## 2. Users Endpoints

### Get all users (Admin/HR only)
- **GET** `/users`
- **Query Params**: `role`, `search`, `department`
- **Response**: Array of user objects

### Create a new user (Admin/HR only)
- **POST** `/users`
- **Request Body**: Same as register, but can specify role
- **Response**: User object

### Get user by ID
- **GET** `/users/:id`

### Update user
- **PUT** `/users/:id`

### Delete user (Admin only)
- **DELETE** `/users/:id`

---

## 3. Attendance Endpoints

### Check in
- **POST** `/attendance/checkin`

### Check out
- **POST** `/attendance/checkout`

### Get my attendance
- **GET** `/attendance/my`
- **Query Params**: `startDate`, `endDate`

### Get attendance by range (Admin/HR only)
- **GET** `/attendance/range`

### Get daily attendance
- **GET** `/attendance/daily/:date`

### Get weekly attendance
- **GET** `/attendance/weekly/:date`

### Get monthly attendance
- **GET** `/attendance/monthly/:year/:month`

### Update attendance (Admin/HR only)
- **PUT** `/attendance/:id`

---

## 4. Leave Endpoints

### Apply for leave
- **POST** `/leave/apply`
- **Request Body**:
  ```json
  {
    "leaveType": "paid",
    "startDate": "2026-07-10",
    "endDate": "2026-07-12",
    "reason": "Vacation"
  }
  ```

### Get my leaves
- **GET** `/leave/my`
- **Query Param**: `status`

### Get all leaves (Admin/HR only)
- **GET** `/leave`
- **Query Params**: `status`, `employeeId`

### Approve leave (Admin/HR only)
- **PUT** `/leave/:id/approve`

### Reject leave (Admin/HR only)
- **PUT** `/leave/:id/reject`
- **Request Body**:
  ```json
  {
    "rejectionReason": "Busy period"
  }
  ```

### Cancel leave
- **PUT** `/leave/:id/cancel`

---

## 5. Payroll Endpoints

### Get my payroll
- **GET** `/payroll/my`
- **Query Params**: `month`, `year`

### Get all payroll (Admin/HR only)
- **GET** `/payroll`
- **Query Params**: `month`, `year`, `employeeId`, `status`

### Create payroll (Admin/HR only)
- **POST** `/payroll`
- **Request Body**:
  ```json
  {
    "employee": "<user-id>",
    "month": "July",
    "year": 2026,
    "basicSalary": 5000,
    "hra": 500,
    "da": 200,
    "otherAllowances": 100,
    "deductions": 150,
    "paidDays": 22,
    "unpaidDays": 0
  }
  ```

### Update payroll (Admin/HR only)
- **PUT** `/payroll/:id`

### Process payroll (Admin/HR only)
- **PUT** `/payroll/:id/process`

### Mark as paid (Admin/HR only)
- **PUT** `/payroll/:id/pay`

### Delete payroll (Admin only)
- **DELETE** `/payroll/:id`

---

## User Roles
- **Employee**: Can view own profile, check in/out, apply for leave, view own payroll
- **HR Officer**: All employee features + manage users, attendance, leave, payroll
- **Admin**: All HR features + delete users and payroll records
