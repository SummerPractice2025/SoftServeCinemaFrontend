import { Navigate } from 'react-router-dom';
import apiService from '../services/api';
import { useUserData } from '../context/UserDataContext';
import type { ReactNode } from 'react';

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { userData } = useUserData();

  if (!apiService.isAuthenticated() || !userData?.user.is_admin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
