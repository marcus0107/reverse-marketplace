import { useState } from 'react';
import { api } from './api';

export default function Login({ onLogin, notify }) {
  const [f, setF] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setBusy(true);
    try {
      await api('/login', { method: 'POST', body: f });
      onLogin(await api('/me'));
    } catch (err) { notify(err.message); setBusy(false); }
  }

  return (
    <main className="auth">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">ADMIN</span>
        <h1>Admin login.</h1>
        <p>This area is for the platform owner only.</p>
        <div className="field"><label>Email</label><input type="email" autoComplete="username" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} required /></div>
        <div className="field"><label>Password</label><input type="password" autoComplete="current-password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} required /></div>
        <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 10 }} disabled={busy}>{busy ? 'Logging in…' : 'Log in →'}</button>
      </form>
    </main>
  );
}
