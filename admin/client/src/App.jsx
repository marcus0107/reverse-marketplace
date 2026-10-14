import { useEffect, useState } from 'react';
import { api } from './api';
import Login from './Login.jsx';
import Panel from './Panel.jsx';

export default function App() {
  const [me, setMe] = useState(undefined); // undefined = checking, null = logged out
  const [toast, setToast] = useState('');

  const notify = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  useEffect(() => { api('/me').then(setMe).catch(() => setMe(null)); }, []);

  async function logout() {
    await api('/logout', { method: 'POST' }).catch(() => {});
    setMe(null);
  }

  return (
    <>
      <header className="navbar">
        <span className="brand">REVERSE ADMIN</span>
        {me && <div className="nav-actions" style={{ display: 'flex' }}>
          <span style={{ alignSelf: 'center', marginRight: 12, fontSize: 14 }}>{me.email}</span>
          <button className="btn btn-light" onClick={logout}>Log out</button>
        </div>}
      </header>
      {me === undefined && <div className="loading" role="status"><span className="spinner" /> Loading…</div>}
      {me === null && <Login onLogin={setMe} notify={notify} />}
      {me && <Panel notify={notify} onExpired={() => setMe(null)} />}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
