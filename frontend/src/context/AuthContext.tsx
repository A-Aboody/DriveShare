import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { auth } from '../lib/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

const SESSION_KEY = 'ds_session';

function readStored(): { user: User | null; token: string | null } {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { user: null, token: null };
    return JSON.parse(raw);
  } catch {
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = readStored();
  const [user, setUser] = useState<User | null>(stored.user);
  const [token, setToken] = useState<string | null>(stored.token);

  const login = useCallback(async (email: string, password: string) => {
    const res = await auth.login(email, password);
    const session = await auth.session();
    const u = session.user as User;
    setUser(u);
    setToken(res.sessionToken);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user: u, token: res.sessionToken }));
  }, []);

  const logout = useCallback(async () => {
    try { await auth.logout(); } catch { /* ignore */ }
    setUser(null);
    setToken(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
