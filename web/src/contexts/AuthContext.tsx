import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, setAuthToken } from '../services/api';

interface AuthContextType {
  user: { email: string } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.me();
      if (response.data.authenticated) {
        setUser(response.data.user);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    // If server returns a token, persist it so future requests include Authorization header
    const token = response.data?.token as string | undefined;
    if (token) setAuthToken(token);
    // Server's /auth/me will return user when token is valid; optimistically set user if included
    if (response.data?.user) {
      setUser(response.data.user);
    } else {
      // Re-check auth status (uses Authorization header interceptor)
      await checkAuth();
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      // Always clear token locally
      setAuthToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
