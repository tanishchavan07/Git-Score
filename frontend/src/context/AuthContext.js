import React, { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { loginUser, registerUser, logoutUser } from '../services/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('gitScoreUser');
    if (stored) {
      try { setUser(JSON.parse(stored)); }
      catch { localStorage.removeItem('gitScoreUser'); }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res      = await loginUser(email, password);
      // Backend now returns { message, user: { name, email } }
      const userData = res.data?.user
        ? { email: res.data.user.email, name: res.data.user.name }
        : { email };
      setUser(userData);
      localStorage.setItem('gitScoreUser', JSON.stringify(userData));
      toast.success(res.data.message || 'Logged in!');
      return { ok: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { ok: false, msg };
    }
  };

  const register = async (name, phone, email, password) => {
    try {
      const res      = await registerUser(name, phone, email, password);
      const userData = res.data?.user
        ? { email: res.data.user.email, name: res.data.user.name }
        : { email, name };
      setUser(userData);
      localStorage.setItem('gitScoreUser', JSON.stringify(userData));
      toast.success(res.data.message || 'Registered!');
      return { ok: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { ok: false, msg };
    }
  };

  const logout = async () => {
    try { await logoutUser(); } catch { /* cookie cleared server-side anyway */ }
    setUser(null);
    localStorage.removeItem('gitScoreUser');
    toast.success('Logged out.');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
