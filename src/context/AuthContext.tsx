import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AdminUser } from '../types';

interface AuthContextType {
  adminUser: AdminUser | null;
  adminToken: string | null;
  isAdminLoggedIn: boolean;
  adminLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string; mustChangePassword?: boolean }>;
  adminLogout: () => void;
  changeAdminPassword: (newPassword: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  refreshAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('sg_admin_token');
  });

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('sg_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const refreshAdmin = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/auth/admin/me', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAdminUser(data);
        localStorage.setItem('sg_admin_user', JSON.stringify(data));
      } else {
        adminLogout();
      }
    } catch (e) {
      console.error('Error fetching admin session', e);
    }
  };

  useEffect(() => {
    if (adminToken) {
      refreshAdmin();
    }
  }, [adminToken]);

  const adminLogin = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'লগইন ব্যর্থ হয়েছে।' };
      }

      setAdminToken(data.token);
      setAdminUser(data.user);
      localStorage.setItem('sg_admin_token', data.token);
      localStorage.setItem('sg_admin_user', JSON.stringify(data.user));

      return {
        success: true,
        mustChangePassword: data.user.mustChangePassword,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'সার্ভার সংযোগে ত্রুটি' };
    }
  };

  const changeAdminPassword = async (newPassword: string, confirmPassword: string) => {
    if (!adminToken) return { success: false, error: 'লগইন করা নেই' };
    try {
      const res = await fetch('/api/auth/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'পাসওয়ার্ড আপডেট ব্যর্থ হয়েছে' };
      }
      if (adminUser) {
        const updated = { ...adminUser, mustChangePassword: false };
        setAdminUser(updated);
        localStorage.setItem('sg_admin_user', JSON.stringify(updated));
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'ত্রুটি ঘটেছে' };
    }
  };

  const adminLogout = () => {
    if (adminToken) {
      fetch('/api/auth/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      }).catch(() => {});
    }
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('sg_admin_token');
    localStorage.removeItem('sg_admin_user');
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        adminToken,
        isAdminLoggedIn: !!adminToken && !!adminUser,
        adminLogin,
        adminLogout,
        changeAdminPassword,
        refreshAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
