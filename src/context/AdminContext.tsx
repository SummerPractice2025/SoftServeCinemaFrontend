import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiService from '../services/api';

interface AdminContextType {
  isAdminMode: boolean;
  setIsAdminMode: (mode: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      setIsAdminMode(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!apiService.isAuthenticated()) {
        setIsAdminMode(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AdminContext.Provider value={{ isAdminMode, setIsAdminMode }}>
      {children}
    </AdminContext.Provider>
  );
};
