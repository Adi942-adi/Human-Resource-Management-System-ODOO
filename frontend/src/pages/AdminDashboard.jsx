import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Search, X, User, Phone, Mail, Building, Calendar } from 'lucide-react';
import { userService } from '../services/api';

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const usersResponse = await userService.getAllUsers();
      const employeeList = usersResponse.data.filter(u => u.role === 'employee');
      setEmployees(employeeList);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.personalDetails?.firstName || ''} ${emp.personalDetails?.lastName || ''}`.toLowerCase();
    const email = emp.email?.toLowerCase() || '';
    const employeeId = emp.employeeId?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query) || employeeId.includes(query);
  });

  const getAttendanceStatus = (emp) => {
    // Random status for now: green = present, yellow = half-day, red = absent
    const statuses = ['green', 'yellow', 'red'];
    return statuses[Math.floor(Math.random() * 3)];
  };

  if (loading) {
    return (
      <Layout isAdmin={true}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAdmin={true}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">Employees</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-purple-500 shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredEmployees.map((emp) => {
            const name = `${emp.personalDetails?.firstName || 'Unknown'} ${emp.personalDetails?.lastName || 'User'}`;
            const statusColor = getAttendanceStatus(emp);
            const bgColor = statusColor === 'green' ? 'bg-green-100' : statusColor === 'yellow' ? 'bg-yellow-100' : 'bg-red-100';
            const dotColor = statusColor === 'green' ? 'bg-green-500' : statusColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500';
            
            return (
              <div
                key={emp._id}
                onClick={() => setSelectedEmployee(emp)}
                className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all border border-slate-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-2xl font-bold">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{name}</h3>
                      <p className="text-sm text-slate-500">{emp.employeeId}</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full ${dotColor} border-2 border-white shadow`} title="Attendance status"></div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm truncate">{emp.email}</span>
                  </div>
                  {emp.jobDetails?.designation && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building className="w-4 h-4" />
                      <span className="text-sm">{emp.jobDetails.designation}</span>
                    </div>
                  )}
                </div>

                <div className={`mt-4 px-3 py-1 rounded-full w-fit text-xs font-semibold ${bgColor} text-slate-700`}>
                  {statusColor === 'green' ? 'Present' : statusColor === 'yellow' ? 'Half-Day' : 'Absent'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Employee Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[1000]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">Employee Details</h2>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-5xl font-bold mb-4">
                  {`${selectedEmployee.personalDetails?.firstName || 'U'}${selectedEmployee.personalDetails?.lastName || 'N'}`.charAt(0)}
                </div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {selectedEmployee.personalDetails?.firstName} {selectedEmployee.personalDetails?.lastName}
                </h3>
                <p className="text-slate-500">{selectedEmployee.employeeId}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-slate-700 mb-3">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Email:</span><span className="text-slate-800">{selectedEmployee.email}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Phone:</span><span className="text-slate-800">{selectedEmployee.personalDetails?.phone || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Date of Birth:</span><span className="text-slate-800">{selectedEmployee.personalDetails?.dateOfBirth || '-'}</span></div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-slate-700 mb-3">Job Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Department:</span><span className="text-slate-800">{selectedEmployee.jobDetails?.department || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Designation:</span><span className="text-slate-800">{selectedEmployee.jobDetails?.designation || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Join Date:</span><span className="text-slate-800">{selectedEmployee.jobDetails?.joinDate || '-'}</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
