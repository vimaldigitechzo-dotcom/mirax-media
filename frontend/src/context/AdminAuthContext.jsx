import React, { createContext, useContext, useState, useEffect } from 'react';
import adminApi from '../services/adminApi';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('mirax_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('mirax_admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      const storedToken = localStorage.getItem('mirax_admin_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await adminApi.getMe();
        if (res.success && res.data) {
          setAdmin(res.data);
          localStorage.setItem('mirax_admin_user', JSON.stringify(res.data));
        }
      } catch (err) {
        setAdmin(null);
        setToken(null);
        localStorage.removeItem('mirax_admin_token');
        localStorage.removeItem('mirax_admin_user');
      } finally {
        setLoading(false);
      }
    }
    verifySession();
  }, []);

  const login = async (email, password) => {
    const res = await adminApi.login(email, password);
    if (res.success && res.data) {
      setToken(res.data.token);
      setAdmin(res.data.admin);
      localStorage.setItem('mirax_admin_token', res.data.token);
      localStorage.setItem('mirax_admin_user', JSON.stringify(res.data.admin));
    }
    return res;
  };

  const logout = async () => {
    await adminApi.logout();
    setToken(null);
    setAdmin(null);
  };

  const updateCurrentAdmin = (updatedAdmin) => {
    setAdmin(updatedAdmin);
    localStorage.setItem('mirax_admin_user', JSON.stringify(updatedAdmin));
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        loading,
        isAuthenticated: Boolean(token && admin),
        login,
        logout,
        updateCurrentAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
}
