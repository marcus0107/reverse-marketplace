import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, CATEGORIES } from '../api';
import { useApp } from '../context.jsx';

export function Login() {
  const navigate = useNavigate();
  const { refresh, notify } = useApp();
  const [f, setF] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const set = e => setF({ ...f, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setBusy(true);
    try { await api('/auth/login', { method: 'POST', body: f }); await refresh(); navigate('/dashboard'); }
    catch (err) { notify(err.message); setBusy(false); }
  }

  return (
    <main className="auth">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">WELCOME BACK</span>
        <h1>Company login.</h1>
        <p>Access your seller account and monitor buyer matches.</p>
        <div className="field"><label>Email</label><input name="email" type="email" value={f.email} onChange={set} required placeholder="company@example.com" /></div>
        <div className="field"><label>Password</label><input name="password" type="password" value={f.password} onChange={set} required placeholder="••••••••" /></div>
        <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 10 }} disabled={busy}>{busy ? 'Logging in…' : 'Log in →'}</button>
        <p style={{ textAlign: 'center' }}><Link to="/forgot-password" style={{ color: '#6d28d9', fontWeight: 800 }}>Forgot password?</Link></p>
        <p style={{ textAlign: 'center', marginBottom: 0 }}>New to the platform? <Link to="/signup" style={{ color: '#6d28d9', fontWeight: 800 }}>Create company account</Link></p>
      </form>
    </main>
  );
}

export function Signup() {
  const navigate = useNavigate();
  const { refresh, notify } = useApp();
  const [f, setF] = useState({ companyName: '', email: '', category: 'Products', location: '', password: '', confirmPassword: '' });
  const [busy, setBusy] = useState(false);
  const set = e => setF({ ...f, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    if (f.password !== f.confirmPassword) return notify('Passwords do not match');
    setBusy(true);
    try {
      await api('/auth/signup', { method: 'POST', body: f });
      await refresh();
      notify('Account created! Your 14-day trial has started.');
      navigate('/listing');
    } catch (err) { notify(err.message); setBusy(false); }
  }

  return (
    <main className="auth">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">JOIN REVERSE</span>
        <h1>Create your company account.</h1>
        <p>Rent your company listing and get matched to buyer needs that fit your offering.</p>
        <div className="notice">14-day free trial. No card needed.</div>
        <div className="field"><label>Company name</label><input name="companyName" value={f.companyName} onChange={set} required placeholder="TechHub Kenya" /></div>
        <div className="field"><label>Email</label><input name="email" type="email" value={f.email} onChange={set} required placeholder="sales@company.com" /></div>
        <div className="field"><label>Category</label><select name="category" value={f.category} onChange={set}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="field"><label>Location</label><input name="location" value={f.location} onChange={set} placeholder="Nairobi" /></div>
        <div className="field"><label>Password</label><input name="password" type="password" minLength={8} value={f.password} onChange={set} required placeholder="At least 8 characters" /></div>
        <div className="field"><label>Confirm password</label><input name="confirmPassword" type="password" value={f.confirmPassword} onChange={set} required placeholder="Repeat your password" /></div>
        <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 10 }} disabled={busy}>{busy ? 'Creating…' : 'Create company account →'}</button>
        <p style={{ textAlign: 'center', marginBottom: 0 }}>Already have an account? <Link to="/login" style={{ color: '#6d28d9', fontWeight: 800 }}>Sign in</Link></p>
      </form>
    </main>
  );
}
