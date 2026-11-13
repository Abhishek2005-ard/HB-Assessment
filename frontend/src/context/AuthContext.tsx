import axios, { AxiosError } from 'axios';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export type UserRole = 'admin' | 'user';

export interface AppUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePicture?: string;
  provider?: string;
  createdAt?: string;
  token?: string;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    profilePicture?: string;
    provider?: string;
  }) => Promise<void>;
  loginWithGoogle: (firebaseToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const API_URL =
  import.meta.env.VITE_API_URL || 'https://mern-auth-backend-qkwp.onrender.com/api';

const AuthContext = createContext<AuthContextValue | null>(null);

const buildAvatar = (name: string, picture?: string) => {
  if (picture) {
    return picture;
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=0ea5e9&color=fff&size=128`;
};

const normalizeUser = (payload: any): AppUser => ({
  _id: payload._id || payload.id || '',
  name: payload.name || 'User',
  email: payload.email || '',
  role: payload.role === 'admin' ? 'admin' : 'user',
  profilePicture: buildAvatar(payload.name || 'User', payload.profilePicture || payload.photoURL),
  provider: payload.provider || 'local',
  createdAt: payload.createdAt || payload.created_at,
  token: payload.token,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const saveSession = (payload: any) => {
    const normalized = normalizeUser(payload);
    localStorage.setItem('token', payload.token || '');
    setUser(normalized);
    return normalized;
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');

    if (!savedToken) {
      setLoading(false);
      return;
    }

    axios
      .get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
      .then((response) => {
        setUser(normalizeUser(response.data));
      })
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const extractError = (err: unknown): string => {
    if (err instanceof AxiosError) {
      if (err.response?.data?.message) {
        return err.response.data.message;
      }
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        return 'Backend server is temporarily unreachable. Please wait a few seconds and try again.';
      }
    }
    if (err instanceof Error) return err.message;
    return 'An unexpected error occurred';
  };

  const login = async (payload: { email: string; password: string }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, payload);
      saveSession(response.data);
    } catch (err) {
      throw new Error(extractError(err));
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    profilePicture?: string;
    provider?: string;
  }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, payload);
      saveSession(response.data);
    } catch (err) {
      throw new Error(extractError(err));
    }
  };

  const loginWithGoogle = async (firebaseToken: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/firebase`, {
        token: firebaseToken,
      });
      saveSession(response.data);
    } catch (err) {
      throw new Error(extractError(err));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore Firebase logout errors
    }

    localStorage.removeItem('token');
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      loginWithGoogle,
      logout,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
