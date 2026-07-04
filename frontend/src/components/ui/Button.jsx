import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white hover:from-[#6d28d9] hover:to-[#4f46e5] focus:ring-[#7C3AED] shadow-md shadow-indigo-500/10 border border-transparent',
    secondary: 'bg-white/60 dark:bg-[#1e1a38]/50 text-gray-700 dark:text-gray-300 border border-gray-250 dark:border-[#2d225c]/40 hover:bg-gray-100 dark:hover:bg-[#252044] focus:ring-gray-300 dark:focus:ring-indigo-900',
    outline: 'border border-gray-300 dark:border-[#2d225c]/60 text-gray-700 dark:text-gray-300 hover:bg-gray-55/40 dark:hover:bg-[#1d193d]/45 focus:ring-indigo-500',
    ghost: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-[#1c193c]/35 focus:ring-indigo-500',
    danger: 'bg-rose-550 text-white hover:bg-rose-600 focus:ring-rose-500 shadow-md shadow-rose-500/10 border border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[11px]',
    md: 'px-4.5 py-2.5 text-xs',
    lg: 'px-6 py-3.5 text-sm',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
export default Button;
