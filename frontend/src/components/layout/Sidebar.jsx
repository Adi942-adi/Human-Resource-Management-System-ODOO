import React from 'react';
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
  BarChart2,
  Settings as SettingsIcon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isAdmin = true, collapsed, onToggle }) => {
  const location = useLocation();
  const { user } = useAuth();

  const userName = user?.personalDetails 
    ? `${user.personalDetails.firstName} ${user.personalDetails.lastName}`
    : user?.name || 'Omkar Satpute';

  const userRole = user?.role === 'admin' ? 'Administrator' : user?.role === 'hr' ? 'HR Officer' : 'Employee';

  const dashboardPath = isAdmin ? '/admin/dashboard' : '/employee/dashboard';

  const sections = isAdmin
    ? [
        {
          title: 'MAIN',
          items: [
            { label: 'Employees', path: '/admin/employees', icon: Users },
          ],
        },
        {
          title: 'WORKFORCE',
          items: [
            { label: 'Attendance', path: '/admin/attendance', icon: Calendar },
            { label: 'Leave Management', path: '/admin/leaves', icon: FileText },
          ],
        },
        {
          title: 'FINANCE',
          items: [
            { label: 'Payroll', path: '/admin/payroll', icon: DollarSign },
          ],
        },
        {
          title: 'REPORTS',
          items: [
            { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart2 },
          ],
        },
        {
          title: 'SETTINGS',
          items: [
            { label: 'My Profile', path: '/employee/profile', icon: User },
            { label: 'Settings', path: '/admin/settings', icon: SettingsIcon },
          ],
        },
      ]
    : [
        {
          title: 'WORKFORCE',
          items: [
            { label: 'Attendance', path: '/employee/attendance', icon: Calendar },
            { label: 'Leave Management', path: '/employee/leaves', icon: FileText },
          ],
        },
        {
          title: 'FINANCE',
          items: [
            { label: 'Payroll', path: '/employee/payroll', icon: DollarSign },
          ],
        },
        {
          title: 'SETTINGS',
          items: [
            { label: 'My Profile', path: '/employee/profile', icon: User },
          ],
        },
      ];

  return (
    <div
      className={`h-screen bg-[#0b0914] text-gray-300 border-r border-[#1a172e]/40 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      } overflow-hidden`}
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-[#1a172e]/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#6366f1] via-[#8b5cf6] to-[#ec4899] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-extrabold text-xl tracking-wider">W</span>
          </div>
          {!collapsed && (
            <div>
              <span className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                WorkPulse AI <Sparkles className="w-4 h-4 text-indigo-400 fill-indigo-400/30" />
              </span>
              <p className="text-[10px] text-gray-500 font-medium">HR Management System</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-6 overflow-y-auto space-y-6">
        {/* Dashboard Link (Featured Item) */}
        <div>
          <NavLink
            to={dashboardPath}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/10'
                  : 'text-gray-400 hover:text-white hover:bg-[#151226]'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-semibold text-[14px]">Dashboard</span>}
          </NavLink>
        </div>

        {/* Sectioned Items */}
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            {!collapsed && (
              <p className="px-4 text-[10px] font-bold text-gray-600 tracking-wider">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item, itemIdx) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={itemIdx}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-[#151226] text-indigo-400 font-semibold'
                        : 'text-gray-400 hover:text-white hover:bg-[#151226]/50'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="text-[13px] font-medium">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}

        {/* WorkPulse AI - Premium 3D Promo Box */}
        {!collapsed && (
          <div className="relative mt-8 p-4 bg-gradient-to-br from-[#1b153a] to-[#0f0a28] border border-[#2d225c] rounded-2xl overflow-hidden shadow-inner">
            <div className="absolute -right-2 -bottom-2 w-20 h-20 opacity-90">
              <img
                src="/sidebar_robot_3d.png"
                alt="AI Robot"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>
            <div className="relative z-10 pr-12">
              <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold text-white bg-indigo-600 rounded-md mb-2">
                NEW
              </span>
              <h4 className="text-xs font-bold text-white">WorkPulse AI</h4>
              <p className="text-[9px] text-gray-400 mt-1 leading-relaxed">
                AI-Powered Insights for Smarter HR Decisions.
              </p>
              <button className="mt-3 text-[9px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                Explore AI Insights &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Info Bar & Collapse Button */}
      <div className="p-4 border-t border-[#1a172e]/30 flex flex-col gap-3">
        {!collapsed && (
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#151226]/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full bg-indigo-900/60 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
                {userName.charAt(0).toUpperCase()}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0b0914] rounded-full"></span>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white truncate max-w-[120px]">{userName}</p>
                <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{userRole}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </div>
        )}

        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2.5 text-gray-500 hover:text-white hover:bg-[#151226] rounded-xl transition-all"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
