import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { MyProfile } from './pages/MyProfile';
import { EmployeeAttendance } from './pages/EmployeeAttendance';
import { EmployeeLeaves } from './pages/EmployeeLeaves';
import { EmployeePayroll } from './pages/EmployeePayroll';
import { AdminEmployees } from './pages/AdminEmployees';
import { AdminAttendance } from './pages/AdminAttendance';
import { AdminLeaves } from './pages/AdminLeaves';
import { AdminPayroll } from './pages/AdminPayroll';
import { AdminReports } from './pages/AdminReports';
import { AdminSettings } from './pages/AdminSettings';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route 
        path="/employee/dashboard" 
        element={
          <ProtectedRoute role="employee">
            <EmployeeDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/employee/profile" 
        element={
          <ProtectedRoute role="employee">
            <MyProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/employee/attendance" 
        element={
          <ProtectedRoute role="employee">
            <EmployeeAttendance />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/employee/leaves" 
        element={
          <ProtectedRoute role="employee">
            <EmployeeLeaves />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/employee/payroll" 
        element={
          <ProtectedRoute role="employee">
            <EmployeePayroll />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/employees" 
        element={
          <ProtectedRoute>
            <AdminEmployees />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/attendance" 
        element={
          <ProtectedRoute>
            <AdminAttendance />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/leaves" 
        element={
          <ProtectedRoute>
            <AdminLeaves />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/payroll" 
        element={
          <ProtectedRoute>
            <AdminPayroll />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/reports" 
        element={
          <ProtectedRoute>
            <AdminReports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/settings" 
        element={
          <ProtectedRoute>
            <AdminSettings />
          </ProtectedRoute>
        } 
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
