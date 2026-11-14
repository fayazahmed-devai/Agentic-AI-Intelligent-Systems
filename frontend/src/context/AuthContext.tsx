import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    full_name: string;
    email: string;
    password: string;
    confirm_password: string;
    terms: boolean;
  }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('nexusmind_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res: any = await api.get('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('nexusmind_user', JSON.stringify(res.data));
      }
    } catch (err: any) {
      setUser(null);
      localStorage.removeItem('nexusmind_user');
      localStorage.removeItem('nexusmind_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res: any = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem('nexusmind_user', JSON.stringify(res.data));
      if (res.token) {
        localStorage.setItem('nexusmind_token', res.token);
      }
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (payload: {
    full_name: string;
    email: string;
    password: string;
    confirm_password: string;
    terms: boolean;
  }): Promise<User> => {
    const res: any = await api.post('/auth/register', payload);
    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem('nexusmind_user', JSON.stringify(res.data));
      if (res.token) {
        localStorage.setItem('nexusmind_token', res.token);
      }
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      setUser(null);
      localStorage.removeItem('nexusmind_user');
      localStorage.removeItem('nexusmind_token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
