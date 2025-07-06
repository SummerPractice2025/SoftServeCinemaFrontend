import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

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
    const userId = 0;
    const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
    const ADMIN_BEARER_TOKEN = import.meta.env.VITE_ACCESS_TOKEN_SECRET;

    try {
      const response = await fetch(`${backendBaseUrl}user/${userId}`, {
        headers: {
          Authorization: `Bearer ${ADMIN_BEARER_TOKEN}`,
        },
      });

      if (response.ok) {
        const data: UserData = await response.json();
        setUserData(data);
      }
    } catch (err) {
      console.error('Помилка при отриманні даних користувача:', err);
    }
  };

  useEffect(() => {
    fetchUserData();
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
