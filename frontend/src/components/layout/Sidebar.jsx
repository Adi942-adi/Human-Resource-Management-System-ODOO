import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Calendar,
  FileText,
  DollarSign,
  Users,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';

const employeeNavItems = [
  { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', path: '/employee/profile', icon: User },
  { label: 'Attendance', path: '/employee/attendance', icon: Calendar },
  { label: 'Leave Management', path: '/employee/leaves', icon: FileText },
  { label: 'Payroll', path: '/employee/payroll', icon: DollarSign },
];

const adminNavItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Employee Management', path: '/admin/employees', icon: Users },
  { label: 'Attendance Management', path: '/admin/attendance', icon: Calendar },
  { label: 'Leave Approval', path: '/admin/leaves', icon: FileText },
  { label: 'Payroll Management', path: '/admin/payroll', icon: DollarSign },
];

export const Sidebar = ({ isAdmin = true, collapsed, onToggle }) => {
  const location = useLocation();
  const navItems = isAdmin ? adminNavItems : employeeNavItems;

  return (
    <div className={`h-screen bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-gray-900">HRMS</span>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={index}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
