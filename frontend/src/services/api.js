import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  register: (userData) =>
    api.post('/auth/register', userData),
  getCurrentUser: () =>
    api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  },
};

// User endpoints
export const userService = {
  getAllUsers: (params = {}) =>
    api.get('/users', { params }),
  getUserById: (id) =>
    api.get(`/users/${id}`),
  createUser: (userData) =>
    api.post('/users', userData),
  updateUser: (id, userData) =>
    api.put(`/users/${id}`, userData),
  deleteUser: (id) =>
    api.delete(`/users/${id}`),
};

// Attendance endpoints
export const attendanceService = {
  checkIn: () =>
    api.post('/attendance/checkin'),
  checkOut: () =>
    api.post('/attendance/checkout'),
  getMyAttendance: (startDate, endDate) =>
    api.get('/attendance/my', { params: { startDate, endDate } }),
  getAttendanceRange: (startDate, endDate, employeeId) =>
    api.get('/attendance/range', { params: { startDate, endDate, employeeId } }),
  getDailyAttendance: (date) =>
    api.get(`/attendance/daily/${date}`),
  getWeeklyAttendance: (date) =>
    api.get(`/attendance/weekly/${date}`),
  getMonthlyAttendance: (year, month) =>
    api.get(`/attendance/monthly/${year}/${month}`),
  updateAttendance: (id, data) =>
    api.put(`/attendance/${id}`, data),
};

// Leave endpoints
export const leaveService = {
  applyLeave: (leaveData) =>
    api.post('/leave/apply', leaveData),
  getMyLeaves: (status) =>
    api.get('/leave/my', { params: { status } }),
  getAllLeaves: (status, employeeId) =>
    api.get('/leave', { params: { status, employeeId } }),
  approveLeave: (id) =>
    api.put(`/leave/${id}/approve`),
  rejectLeave: (id, rejectionReason) =>
    api.put(`/leave/${id}/reject`, { rejectionReason }),
  cancelLeave: (id) =>
    api.put(`/leave/${id}/cancel`),
};

// Payroll endpoints
export const payrollService = {
  getMyPayroll: (month, year) =>
    api.get('/payroll/my', { params: { month, year } }),
  getAllPayroll: (month, year, employeeId, status) =>
    api.get('/payroll', { params: { month, year, employeeId, status } }),
  createPayroll: (payrollData) =>
    api.post('/payroll', payrollData),
  updatePayroll: (id, data) =>
    api.put(`/payroll/${id}`, data),
  processPayroll: (id) =>
    api.put(`/payroll/${id}/process`),
  markAsPaid: (id) =>
    api.put(`/payroll/${id}/pay`),
  deletePayroll: (id) =>
    api.delete(`/payroll/${id}`),
};

export default api;
