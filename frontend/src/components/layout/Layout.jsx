import React from 'react';
import { Navbar } from './Navbar';
import { useAuth } from '../../context/AuthContext';

export const Layout = ({ children, isAdmin = true }) => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      <Navbar user={user} isAdmin={isAdmin} />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};
