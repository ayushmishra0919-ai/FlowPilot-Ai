import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('flowpilot_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('flowpilot_token');
      const savedUser = localStorage.getItem('flowpilot_user');

      if (savedToken && savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          // Verify session with live backend
          const res = await api.get('/auth/me');
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('flowpilot_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          // If token explicitly expired (401) on a non-demo account, log out
          if (err.response?.status === 401) {
            try {
              const parsed = JSON.parse(savedUser);
              if (parsed.email !== 'demo@flowpilot.ai') {
                console.warn('Session expired, logging out');
                logout();
              }
            } catch (e) {
              logout();
            }
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const normalizedEmail = email.toLowerCase().trim();
    try {
      const res = await api.post('/auth/login', { email: normalizedEmail, password });
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('flowpilot_token', newToken);
      localStorage.setItem('flowpilot_user', JSON.stringify(newUser));
      return newUser;
    } catch (err) {
      // If authenticating demo account and network/cold-start occurs, provide offline demo fallback
      if (normalizedEmail === 'demo@flowpilot.ai' && password === 'password123') {
        const demoUser = {
          id: 'user-admin-001',
          name: 'Alex Vance',
          email: 'demo@flowpilot.ai',
          role: 'admin',
          createdAt: new Date().toISOString()
        };
        const demoToken = 'flowpilot_demo_jwt_token_' + Date.now();
        setToken(demoToken);
        setUser(demoUser);
        localStorage.setItem('flowpilot_token', demoToken);
        localStorage.setItem('flowpilot_user', JSON.stringify(demoUser));
        return demoUser;
      }
      throw err;
    }
  };

  const register = async (name, email, password) => {
    const normalizedEmail = email.toLowerCase().trim();
    const res = await api.post('/auth/register', { name, email: normalizedEmail, password });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('flowpilot_token', newToken);
    localStorage.setItem('flowpilot_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('flowpilot_token');
    localStorage.removeItem('flowpilot_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout
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
