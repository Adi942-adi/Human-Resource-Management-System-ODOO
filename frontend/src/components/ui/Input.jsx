import React from 'react';

export const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full px-4 py-2.5 bg-white/70 dark:bg-[#131129]/70 border border-gray-200 dark:border-[#2d225c]/55 rounded-xl text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-450 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all duration-300 ${className}`}
      {...props}
    />
  );
};
export default Input;
