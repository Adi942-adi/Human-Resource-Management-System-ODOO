import React from 'react';

export const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white/70 dark:bg-[#131129]/75 backdrop-blur-xl border border-gray-200/50 dark:border-[#2d225c]/45 rounded-[24px] shadow-sm transition-colors duration-300 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4.5 border-b border-gray-100 dark:border-[#2d225c]/30 ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 className={`text-sm font-extrabold text-gray-950 dark:text-white tracking-tight ${className}`}>
      {children}
    </h3>
  );
};

export const CardContent = ({ children, className = '' }) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};
export default Card;
