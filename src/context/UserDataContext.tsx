import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiService from '../services/api';

interface User {
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
}

interface Booking {
  movieName: string;
  moviePosterUrl: string;
  date: string;
  description: string;
  seatRow: number;
  seatCol: number;
  isVIP: boolean;
  hallID: number;
}

interface UserData {
  user: User;
  bookings: Booking[];
}

interface UserDataContextType {
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  refreshUserData: () => void;
  refreshTrigger: number;
  fetchUserData: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined,
);

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};

interface UserDataProviderProps {
  children: ReactNode;
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({
  children,
}) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchUserData = async () => {
    if (!apiService.isAuthenticated()) {
      setUserData(null);
      return;
    }

    const userId = apiService.getCurrentUserId();
    if (!userId) {
      setUserData(null);
      return;
    }

    try {
      // Используем apiService для запроса (refresh токена сработает автоматически)
      const response = await apiService.get<{
        user: User;
        bookings: Booking[];
      }>(`/user/${userId}`);
      setUserData(response.data);
    } catch (err) {
      // Если после всех попыток пользователь не авторизован — сбрасываем userData
      if (!apiService.isAuthenticated()) {
        setUserData(null);
      }
      console.error('Помилка при отриманні даних користувача:', err);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [refreshTrigger]);

  useEffect(() => {
    if (apiService.isAuthenticated()) {
      fetchUserData();
    } else {
      setUserData(null);
    }
  }, []);

  const refreshUserData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const contextValue = {
    userData,
    setUserData,
    refreshUserData,
    refreshTrigger,
    fetchUserData,
  };

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
};
