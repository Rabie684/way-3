import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { getCurrentUser, setCurrentUser, login as authLogin, register as authRegister, logout as authLogout, getUserDetails, updateUserDetails as updateUserDetailsApi } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id'>) => Promise<boolean>;
  logout: () => void;
  updateUserDetails: (updates: Partial<User>) => Promise<boolean>;
  translate: (key: string) => string;
  language: 'ar' | 'fr';
  setLanguage: (lang: 'ar' | 'fr') => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  translations: { [key: string]: { ar: string; fr: string } };
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, translations }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [language, setLanguageState] = useState<'ar' | 'fr'>(() => {
    return (localStorage.getItem('language') as 'ar' | 'fr') || 'ar';
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
    document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    const loggedInUser = await authLogin(email, password);
    setLoading(false);
    if (loggedInUser) {
      setUser(loggedInUser);
      setCurrentUser(loggedInUser);
      return true;
    }
    return false;
  };

  const register = async (userData: Omit<User, 'id'>): Promise<boolean> => {
    setLoading(true);
    const registeredUser = await authRegister(userData);
    setLoading(false);
    if (registeredUser) {
      setUser(registeredUser);
      setCurrentUser(registeredUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    authLogout();
  };

  const updateUserDetails = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);
    const updatedUser = await updateUserDetailsApi(user.id, updates);
    setLoading(false);
    if (updatedUser) {
      setUser(updatedUser);
      return true;
    }
    return false;
  };

  const translate = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const setLanguage = (lang: 'ar' | 'fr') => {
    setLanguageState(lang);
    if (user) {
      updateUserDetails( {language: lang}); // Update user language preference
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUserDetails,
    translate,
    language,
    setLanguage,
    isDarkMode,
    toggleDarkMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
