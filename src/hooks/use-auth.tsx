"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User } from '@/lib/types';
import { getUsersFromStorage, setUsersToStorage } from '@/lib/mock-data';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (credentials: { email: string; password?: string }) => string | undefined;
  signup: (data: Omit<User, 'id'>) => { success: boolean; message?: string };
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initialize users in storage if not present
    getUsersFromStorage();

    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (credentials: { email: string; password?: string }): string | undefined => {
    const users = getUsersFromStorage();
    const userToLogin = users.find(
      u => u.email === credentials.email && u.password === credentials.password
    );

    if (userToLogin) {
      setUser(userToLogin);
      localStorage.setItem('user', JSON.stringify(userToLogin));
      router.push(`/${userToLogin.role}/dashboard`);
      return undefined; // Success
    } else {
      return 'Invalid email or password.';
    }
  };

  const signup = (data: Omit<User, 'id'>): { success: boolean, message?: string } => {
    const users = getUsersFromStorage();
    if (users.some(u => u.email === data.email)) {
        return { success: false, message: 'An account with this email already exists.' };
    }

    const existingIds = users.map(u => parseInt(u.id, 10)).filter(id => !isNaN(id));
    const newId = (Math.max(0, ...existingIds) + 1).toString();

    const newUser: User = { ...data, id: newId };
    const updatedUsers = [...users, newUser];
    setUsersToStorage(updatedUsers);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/login');
  };

  useEffect(() => {
    const publicPages = ['/login', '/signup', '/'];
    const isPublicPage = publicPages.includes(pathname);
    if (!loading && !user && !isPublicPage) {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);


  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
