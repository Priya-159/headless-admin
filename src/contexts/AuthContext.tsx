import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import http from '../utils/http';
import { mockApi } from '../services/mockApi';

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMockMode: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(false);

  const refreshUser = async () => {
    try {
      // Try to get user info from /auth/me/ endpoint
      const userData = await http.get('/auth/me/');
      setUser(userData);
      setIsMockMode(false);
    } catch (error: any) {
      // Check if it's a network error (Django not running)
      if (error.message === 'NETWORK_ERROR') {
        // Silently switch to mock mode
        if (http.getToken()) {
          try {
            const mockUser = await mockApi.getUserInfo();
            setUser(mockUser);
            setIsMockMode(true);
            return;
          } catch (mockError) {
            // Fall through to default user
          }
        }

        // If mock also fails, use minimal user data from token
        setUser({
          id: 1,
          username: 'admin',
          email: 'admin@fuelabc.com',
        });
        setIsMockMode(true);
        return;
      }

      // For other errors, log and throw
      console.error('Failed to fetch user data:', error);
      throw error;
    }
  };

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = http.getToken();
      if (token) {
        try {
          await refreshUser();
        } catch (error) {
          console.error('Failed to refresh user:', error);
          http.clearTokens();
        }
      }
      setIsLoading(false);
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Try Django first
      const response = await http.post('/auth/token/', { username, password });

      // Store tokens
      http.setTokens(response.access, response.refresh);

      // Fetch user data
      await refreshUser();
      setIsMockMode(false);
    } catch (error: any) {
      // Check if it's a network error (Django not running)
      if (error.message === 'NETWORK_ERROR') {
        console.log('🔧 Django not available, switching to mock mode...');

        try {
          // Use mock API
          const mockResponse = await mockApi.login(username, password);

          // Store mock tokens
          http.setTokens(mockResponse.access, mockResponse.refresh);

          // Get mock user data
          const mockUser = await mockApi.getUserInfo();
          setUser(mockUser);
          setIsMockMode(true);

          console.log('✅ Logged in with mock data');
          return; // Success with mock data
        } catch (mockError: any) {
          throw new Error(mockError.message || 'Invalid credentials');
        }
      }

      // For other errors, throw them
      throw error;
    }
  };

  const logout = () => {
    http.clearTokens();
    setUser(null);
    setIsMockMode(false);
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isMockMode,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};