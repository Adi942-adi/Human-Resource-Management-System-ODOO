export const mockEmployees = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Employee",
    department: "Engineering",
    position: "Senior Developer",
    joiningDate: "2022-05-15",
    phone: "+1 234 567 8900",
    address: "123 Main St, New York, NY",
    avatar: "https://i.pravatar.cc/150?u=john",
    salary: 85000,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@company.com",
    role: "Employee",
    department: "Design",
    position: "UX Designer",
    joiningDate: "2023-01-20",
    phone: "+1 234 567 8901",
    address: "456 Oak Ave, Brooklyn, NY",
    avatar: "https://i.pravatar.cc/150?u=jane",
    salary: 75000,
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    role: "Admin",
    department: "Human Resources",
    position: "HR Manager",
    joiningDate: "2020-08-10",
    phone: "+1 234 567 8902",
    address: "789 Pine Rd, Queens, NY",
    avatar: "https://i.pravatar.cc/150?u=mike",
    salary: 95000,
  },
  {
    id: 4,
    name: "Sarah Williams",
    email: "sarah.williams@company.com",
    role: "Employee",
    department: "Marketing",
    position: "Marketing Specialist",
    joiningDate: "2023-06-05",
    phone: "+1 234 567 8903",
    address: "321 Maple Dr, Manhattan, NY",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    salary: 65000,
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@company.com",
    role: "Employee",
    department: "Engineering",
    position: "Junior Developer",
    joiningDate: "2024-01-10",
    phone: "+1 234 567 8904",
    address: "654 Cedar Ln, Bronx, NY",
    avatar: "https://i.pravatar.cc/150?u=david",
    salary: 55000,
  },
];

export const mockAttendance = [
  { id: 1, employeeId: 1, date: "2024-07-01", checkIn: "09:00 AM", checkOut: "05:30 PM", status: "Present", hours: 8.5 },
  { id: 2, employeeId: 1, date: "2024-07-02", checkIn: "09:15 AM", checkOut: "05:45 PM", status: "Present", hours: 8.5 },
  { id: 3, employeeId: 1, date: "2024-07-03", checkIn: "08:50 AM", checkOut: "06:00 PM", status: "Present", hours: 9.17 },
  { id: 4, employeeId: 1, date: "2024-07-04", checkIn: null, checkOut: null, status: "Holiday", hours: 0 },
  { id: 5, employeeId: 1, date: "2024-07-05", checkIn: "09:30 AM", checkOut: "05:00 PM", status: "Half-day", hours: 4.5 },
  { id: 6, employeeId: 2, date: "2024-07-01", checkIn: "09:05 AM", checkOut: "05:35 PM", status: "Present", hours: 8.5 },
  { id: 7, employeeId: 2, date: "2024-07-02", checkIn: "09:20 AM", checkOut: "05:40 PM", status: "Present", hours: 8.33 },
  { id: 8, employeeId: 2, date: "2024-07-03", checkIn: null, checkOut: null, status: "Leave", hours: 0 },
];

export const mockLeaves = [
  { id: 1, employeeId: 1, type: "Paid Leave", startDate: "2024-07-10", endDate: "2024-07-12", reason: "Family vacation", status: "Approved", days: 3 },
  { id: 2, employeeId: 2, type: "Sick Leave", startDate: "2024-07-03", endDate: "2024-07-03", reason: "Fever", status: "Approved", days: 1 },
  { id: 3, employeeId: 4, type: "Unpaid Leave", startDate: "2024-07-15", endDate: "2024-07-16", reason: "Personal matters", status: "Pending", days: 2 },
  { id: 4, employeeId: 5, type: "Paid Leave", startDate: "2024-07-20", endDate: "2024-07-22", reason: "Wedding", status: "Pending", days: 3 },
];

export const mockPayroll = [
  { id: 1, employeeId: 1, month: "June 2024", basic: 5000, hra: 2000, allowances: 1500, deductions: 800, net: 7700, status: "Paid" },
  { id: 2, employeeId: 1, month: "May 2024", basic: 5000, hra: 2000, allowances: 1500, deductions: 800, net: 7700, status: "Paid" },
  { id: 3, employeeId: 2, month: "June 2024", basic: 4500, hra: 1800, allowances: 1200, deductions: 650, net: 6850, status: "Paid" },
  { id: 4, employeeId: 3, month: "June 2024", basic: 6000, hra: 2400, allowances: 1800, deductions: 950, net: 9250, status: "Processed" },
];

export const mockDashboardStats = {
  employee: {
    totalPresent: 18,
    totalLeaves: 2,
    pendingLeaves: 1,
    averageHours: 8.2,
  },
  admin: {
    totalEmployees: 5,
    presentToday: 4,
    pendingLeaves: 2,
    totalPayroll: 35000,
  },
};
