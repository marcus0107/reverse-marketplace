import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../context.jsx';

export function ForgotPassword() {
  const { notify } = useApp();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setBusy(true);
    try { await api('/auth/forgot', { method: 'POST', body: { email } }); setSent(true); }
    catch (err) { notify(err.message); }
    setBusy(false);
  }

  return (
    <main className="auth">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">FORGOT PASSWORD</span>
        <h1>Reset your password.</h1>
        <p>Enter your account email and we will send you a reset link.</p>
        {sent ? (
          <div className="notice">If that email is registered, a reset link has been sent. Check your inbox and spam folder. The link works for 1 hour.</div>
        ) : (
          <>
            <div className="field"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="company@example.com" /></div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 10 }} disabled={busy}>{busy ? 'Sending…' : 'Send reset link →'}</button>
          </>
        )}
        <p style={{ textAlign: 'center', marginBottom: 0 }}><Link to="/login" style={{ color: '#6d28d9', fontWeight: 800 }}>Back to login</Link></p>
      </form>
    </main>
  );
}

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const { notify } = useApp();
  const [f, setF] = useState({ password: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (f.password !== f.confirm) return notify('Passwords do not match');
    setBusy(true);
    try {
      await api('/auth/reset', { method: 'POST', body: { token, password: f.password } });
      notify('Password changed. Please log in.');
      navigate('/login');
    } catch (err) { notify(err.message); setBusy(false); }
  }

  if (!token) return <main className="auth"><div className="auth-card"><div className="notice">This link is missing its token. <Link to="/forgot-password">Request a new one</Link>.</div></div></main>;

  return (
    <main className="auth">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">NEW PASSWORD</span>
        <h1>Choose a new password.</h1>
        <div className="field"><label>New password</label><input type="password" minLength={8} value={f.password} onChange={e => setF({ ...f, password: e.target.value })} required placeholder="At least 8 characters" /></div>
        <div className="field"><label>Confirm password</label><input type="password" value={f.confirm} onChange={e => setF({ ...f, confirm: e.target.value })} required placeholder="Repeat your password" /></div>
        <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 10 }} disabled={busy}>{busy ? 'Saving…' : 'Change password →'}</button>
      </form>
    </main>
  );
}
