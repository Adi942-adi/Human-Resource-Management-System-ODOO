import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { DashboardCard } from '../components/ui/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Users, Calendar, FileText, DollarSign } from 'lucide-react';
import { userService, attendanceService, leaveService, payrollService } from '../services/api';

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    totalPayroll: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch total employees
      const usersResponse = await userService.getAllUsers();
      const employees = usersResponse.data.filter(u => u.role === 'employee');
      const totalEmployees = employees.length;

      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0];
      const attendanceResponse = await attendanceService.getDailyAttendance(today);
      const presentToday = attendanceResponse.data.filter(a => a.status === 'present').length;

      // Fetch pending leaves
      const leaveResponse = await leaveService.getAllLeaves('pending');
      const pendingLeaves = leaveResponse.data.length;

      // Fetch total payroll for current month
      const now = new Date();
      const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      const payrollResponse = await payrollService.getAllPayroll(
        monthNames[now.getMonth()],
        now.getFullYear()
      );
      const totalPayroll = payrollResponse.data.reduce((sum, p) => sum + p.netSalary, 0);

      setStats({
        totalEmployees,
        presentToday,
        pendingLeaves,
        totalPayroll,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout isAdmin={true}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAdmin={true}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={Users}
            trend="+2 this month"
            trendUp
          />
          <DashboardCard
            title="Present Today"
            value={stats.presentToday}
            icon={Calendar}
          />
          <DashboardCard
            title="Pending Leaves"
            value={stats.pendingLeaves}
            icon={FileText}
          />
          <DashboardCard
            title="Total Payroll"
            value={`$${stats.totalPayroll.toLocaleString()}`}
            icon={DollarSign}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-blue-700 font-medium">
                View All Employees
              </button>
              <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-green-700 font-medium">
                Process Payroll
              </button>
              <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-700 font-medium">
                Approve Leaves
              </button>
              <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-purple-700 font-medium">
                View Reports
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
