import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { StatusBadge } from '../components/ui/StatusBadge';
import { payrollService } from '../services/api';
import { format } from 'date-fns';

export const EmployeePayroll = () => {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const month = now.getMonth() + 1; // 1-12
        const year = now.getFullYear();
        
        const response = await payrollService.getMyPayroll(month, year);
        setPayroll(Array.isArray(response.data) ? response.data : [response.data]);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load payroll data');
        console.error('Error fetching payroll:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayroll();
  }, []);

  if (loading) {
    return (
      <Layout isAdmin={false}>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading payroll data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAdmin={false}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Payroll History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Basic</TableHead>
                  <TableHead>HRA</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payroll.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>
                      {format(new Date(record.payrollMonth), 'MMM yyyy')}
                    </TableCell>
                    <TableCell>${record.basicSalary?.toFixed(2)}</TableCell>
                    <TableCell>${record.hra?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>${record.allowances?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>${record.totalDeductions?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>${record.netSalary?.toFixed(2)}</TableCell>
                    <TableCell><StatusBadge status={record.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
