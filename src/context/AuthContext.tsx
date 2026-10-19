import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AdminUser } from '../types';
import { getApiUrl } from '../utils/api';

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
      const res = await fetch(getApiUrl('/api/auth/admin/me'), {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setAdminUser(data);
        localStorage.setItem('sg_admin_user', JSON.stringify(data));
      } else if (res.status === 401 && contentType.includes('application/json')) {
        adminLogout();
      }
      // On static hosting like Netlify (404 / HTML), keep existing local admin session!
    } catch (e) {
      console.warn('Could not contact remote auth service, retaining local session:', e);
    }
  };

  useEffect(() => {
    if (adminToken) {
      refreshAdmin();
    }
  }, [adminToken]);

  const adminLogin = async (username: string, password: string) => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, error: 'ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন।' };
    }

    // 1. First, attempt remote server login if a backend or dev server is active
    try {
      const res = await fetch(getApiUrl('/api/auth/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password: cleanPass }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.token) {
          setAdminToken(data.token);
          setAdminUser(data.user);
          localStorage.setItem('sg_admin_token', data.token);
          localStorage.setItem('sg_admin_user', JSON.stringify(data.user));
          return {
            success: true,
            mustChangePassword: data.user.mustChangePassword,
          };
        } else {
          return { success: false, error: data.error || 'লগইন ব্যর্থ হয়েছে।' };
        }
      }
    } catch (err) {
      console.warn('Backend server unavailable, attempting static client verification:', err);
    }

    // 2. Netlify static hosting verification (prevents "Unexpected token <" HTML error)
    const storedPass = localStorage.getItem('sg_admin_password') || '123456';
    const isUserValid = cleanUser === 'admin@sarder' || cleanUser === 'admin';
    const isPassValid = cleanPass === storedPass;

    if (isUserValid && isPassValid) {
      const hasChangedPass = localStorage.getItem('sg_admin_password_changed') === 'true';
      const localAdmin: AdminUser = {
        id: 'admin-1',
        username: 'admin@sarder',
        email: 'admin@sardergallery.com',
        fullName: 'Sarder Gallery Administrator',
        role: 'super_admin',
        mustChangePassword: !hasChangedPass,
        createdAt: '2026-10-17T11:21:05.856Z',
      };
      const token = `sg_token_${Date.now()}`;
      setAdminToken(token);
      setAdminUser(localAdmin);
      localStorage.setItem('sg_admin_token', token);
      localStorage.setItem('sg_admin_user', JSON.stringify(localAdmin));

      return {
        success: true,
        mustChangePassword: localAdmin.mustChangePassword,
      };
    } else {
      return { success: false, error: 'ইউজারনেম বা পাসওয়ার্ড সঠিক নয়।' };
    }
  };

  const changeAdminPassword = async (newPassword: string, confirmPassword: string) => {
    if (!adminToken) return { success: false, error: 'লগইন করা নেই' };
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' };
    }
    if (newPassword !== confirmPassword) {
      return { success: false, error: 'উভয় পাসওয়ার্ড একই হতে হবে।' };
    }

    // Attempt remote update if available
    try {
      const res = await fetch(getApiUrl('/api/auth/admin/change-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error || 'পাসওয়ার্ড আপডেট ব্যর্থ হয়েছে' };
        }
      }
    } catch {}

    // Save in local storage for Netlify static host
    localStorage.setItem('sg_admin_password', newPassword);
    localStorage.setItem('sg_admin_password_changed', 'true');
    if (adminUser) {
      const updated = { ...adminUser, mustChangePassword: false };
      setAdminUser(updated);
      localStorage.setItem('sg_admin_user', JSON.stringify(updated));
    }
    return { success: true };
  };

  const adminLogout = () => {
    if (adminToken) {
      fetch(getApiUrl('/api/auth/admin/logout'), {
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
