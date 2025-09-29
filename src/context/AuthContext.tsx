"use client";
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import apiService from "@/mock/apiClient";

export type User = {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  is_teacher?: boolean;
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: { name: string; email: string; password: string; role: 'student' | 'teacher' }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: () => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  
  const showError = (message: string) => {
    console.error(message);
    alert(message);
  };

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const saveToken = useCallback((newToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', newToken);
      setToken(newToken);
    }
  }, []);

  const removeToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      setToken(null);
    }
  }, []);

  const saveUser = useCallback((userData: User) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_role', userData.role);
      localStorage.setItem('user_name', userData.name);
    }
  }, []);

  const isAuthenticated = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    const storedToken = localStorage.getItem('token');
    if (!storedToken) return false;
    
    try {
      return true;
    } catch (error) {
      console.error('Error checking token:', error);
      return false;
    }
  }, [token]);

  const isTokenExpired = useCallback((tokenToCheck: string): boolean => {
    try {
      const base64Url = tokenToCheck.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }, []);

  const refreshToken = useCallback(async () => {
    return false;
  }, [saveToken]);
  const fetchUserData = useCallback(async (token: string) => {
    try {
      const response = await apiService.getCurrentUser();
      
      if (response.data && !('error' in response)) {
        saveUser(response.data);
        return true;
      } else {
        removeToken();
        return false;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      removeToken();
      return false;
    }
  }, [saveUser, removeToken]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (typeof window === 'undefined') {
          if (isMounted.current) setLoading(false);
          return;
        }

        const savedToken = localStorage.getItem('token');

        if (!savedToken) {
          if (isMounted.current) setLoading(false);
          return;
        }

        if (isTokenExpired(savedToken)) {
          removeToken();
          if (isMounted.current) setLoading(false);
          return;
        }

        setToken(savedToken);
        await fetchUserData(savedToken);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    initializeAuth();
  }, [isTokenExpired, fetchUserData, removeToken]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await apiService.login({ email, password });
        if (response.success && response.data) {
          const { user, token } = response.data;
          if (!user || !token) {
            return { success: false, error: 'Invalid response from server' };
          }
          localStorage.setItem('token', token);
          setUser(user);
          setToken(token);
          return { success: true };
        } else {
          const errorMessage = response.error?.message || 'Login failed';
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'An error occurred during login' };
      }
    },
    []
  );

  const register = useCallback(
    async (userData: { name?: string; full_name?: string; email: string; password: string; role: 'student' | 'teacher' }) => {
      try {
        const response = await apiService.register(userData);
        if (response.success && response.data) {
          const { user, token } = response.data;
          if (!user || !token) {
            return { success: false, error: 'Invalid response from server' };
          }
          localStorage.setItem('token', token);
          setUser(user);
          setToken(token);
          return { success: true };
        } else {
          const errorMessage = response.error?.message || 'Registration failed';
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'An error occurred during registration' };
      }
    },
    []
  );

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token');
      window.sessionStorage.clear();
      router.push('/login');
    }
  }, [router, removeToken]);

  const refreshUser = useCallback(async () => {
    if (!isAuthenticated()) return;

    try {
      setLoading(true);
      const response = await apiService.getCurrentUser();
      if (response.data) {
        setUser(response.data);
      } else if (response.error) {
        console.error('Failed to refresh user data:', response.error);
        logout();
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      logout();
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [isAuthenticated, logout]);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
export type { AuthContextType };
