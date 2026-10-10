import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { getToken, setToken, clearToken, setRememberedEmail } from '../api/client';
import { authApi } from '../api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  register: (email: string, password: string, name: string | undefined, remember: boolean) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async (): Promise<void> => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setUser(await authApi.me());
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string, remember: boolean): Promise<void> => {
    const { token, user: u } = await authApi.login({ email, password, rememberMe: remember });
    setToken(token, remember);
    setRememberedEmail(email);
    setUser(u);
  };

  const register = async (
    email: string,
    password: string,
    name: string | undefined,
    remember: boolean,
  ): Promise<void> => {
    const { token, user: u } = await authApi.register({ email, password, name, rememberMe: remember });
    setToken(token, remember);
    setRememberedEmail(email);
    setUser(u);
  };

  const logout = (): void => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
