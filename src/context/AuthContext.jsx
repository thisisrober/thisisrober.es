import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/me').then(res => {
      if (res.data.loggedIn) setAdmin({ username: res.data.username });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const login = async (username, password, remember = false) => {
    const res = await api.post('/admin/login', { username, password, remember });
    if (res.data.success) {
      setAdmin({ username: res.data.username });
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  const logout = async () => {
    await api.post('/admin/logout');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
