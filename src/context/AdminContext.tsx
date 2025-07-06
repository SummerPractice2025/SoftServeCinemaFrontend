import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

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

  return (
    <AdminContext.Provider value={{ isAdminMode, setIsAdminMode }}>
      {children}
    </AdminContext.Provider>
  );
};
