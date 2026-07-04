import React from 'react';

export const StatusBadge = ({ status, children }) => {
  const colors = {
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-700',
    'half-day': 'bg-yellow-100 text-yellow-700',
    holiday: 'bg-blue-100 text-blue-700',
    leave: 'bg-purple-100 text-purple-700',
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
    paid: 'bg-green-100 text-green-700',
    processed: 'bg-blue-100 text-blue-700',
  };
  const normalizedStatus = String(status || '').toLowerCase();
  const label = normalizedStatus
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-');

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[normalizedStatus] || 'bg-gray-100 text-gray-700'}`}>
      {children || label}
    </span>
  );
};
