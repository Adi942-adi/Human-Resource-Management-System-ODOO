import React from 'react';

export const Table = ({ children, className = '' }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-left border-collapse">
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className = '' }) => {
  return (
    <thead className={`bg-gray-50/50 dark:bg-[#1a163a]/40 border-b border-gray-150/50 dark:border-[#2d225c]/30 ${className}`}>
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className = '' }) => {
  return (
    <tbody className={`divide-y divide-gray-100/60 dark:divide-[#2d225c]/25 ${className}`}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className = '' }) => {
  return (
    <tr className={`hover:bg-gray-50/30 dark:hover:bg-[#1f1a40]/20 transition-colors duration-200 ${className}`}>
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className = '' }) => {
  return (
    <th className={`px-6 py-3.5 text-xs font-bold text-gray-505 dark:text-gray-400 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
};

export const TableCell = ({ children, className = '' }) => {
  return (
    <td className={`px-6 py-4.5 text-xs font-medium text-gray-850 dark:text-gray-250 ${className}`}>
      {children}
    </td>
  );
};
export default Table;
