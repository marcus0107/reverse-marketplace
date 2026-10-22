import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api';

export const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = logged out
  const [toast, setToast] = useState('');

  const refresh = useCallback(async () => {
    try {
      const u = await api('/auth/me');
      setUser({ ...u, isAdmin: Boolean(u.isAdmin) }); // MySQL returns 0/1; a bare 0 would print on the page
    } catch { setUser(null); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const notify = useCallback(msg => { setToast(msg); setTimeout(() => setToast(''), 3000); }, []);
  const logout = async () => { await api('/auth/logout', { method: 'POST' }); setUser(null); };

  return (
    <Ctx.Provider value={{ user, refresh, logout, notify }}>
      {children}
      {toast && <div className="toast">{toast}</div>}
    </Ctx.Provider>
  );
}
