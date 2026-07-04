import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (role === 'employee' && user.role !== 'employee' && user.role !== 'admin' && user.role !== 'hr') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (role !== 'employee' && user.role === 'employee') {
    return <Navigate to="/employee/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
