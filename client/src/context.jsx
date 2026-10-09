import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = logged out
  const [toast, setToast] = useState('');

  const refresh = useCallback(async () => {
    try { setUser(await api('/auth/me')); } catch { setUser(null); }
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
