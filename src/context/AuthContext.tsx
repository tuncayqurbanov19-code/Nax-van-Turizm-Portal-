import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/ui/Toast';

interface UserSession {
  id: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, adminCode?: string) => Promise<'admin' | 'user' | null>;
  register: (fullName: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { success, error, info } = useToast();

  const isAdmin = user?.role === 'admin';

  // Restore session on first load
  useEffect(() => {
    async function initSession() {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        try {
          const session = await api.auth.me();
          if (session && session.user) {
            setUser(session.user);
          } else {
            // invalid session
            logout();
          }
        } catch (e: any) {
          console.warn('Session restoration failed:', e);
          // Only clear session if not a network failure
          if (!e.message.includes('Şəbəkə')) {
            logout();
          }
        }
      }
      setLoading(false);
    }

    initSession();
  }, []);

  const login = async (email: string, password: string, adminCode?: string): Promise<'admin' | 'user' | null> => {
    try {
      setLoading(true);
      const res = await api.auth.login({ email, password, adminCode });
      
      if (res && res.token && res.user) {
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setUser(res.user);
        
        success(`Xoş gəldiniz, ${res.user.fullName}!`, 'Giriş Müvəffəqiyyətlidir');
        return res.user.role;
      }
      return null;
    } catch (err: any) {
      error(err.message || 'Məlumatlar yoxlanılarkən səhv yarandı.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await api.auth.register({ fullName, email, password });
      
      if (res && res.token && res.user) {
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setUser(res.user);
        
        success(`Qeydiyyat tamamlandı! Xoş gəldiniz, ${res.user.fullName}!`, 'Uğurlu Qeydiyyat');
        return true;
      }
      return false;
    } catch (err: any) {
      error(err.message || 'Qeydiyyat zamanı xəta yarandı.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    info('Hesabınızdan uğurla çıxış etdiniz.', 'Çıxış Olundu');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
