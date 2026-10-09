import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, money } from '../api';
import { useApp } from '../context.jsx';

export default function Pricing() {
  const { user, notify } = useApp();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [chosen, setChosen] = useState(null);
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | waiting | success | failed
  const [message, setMessage] = useState('');
  const timer = useRef(null);

  useEffect(() => { api('/payments/plans').then(setPlans).catch(e => notify(e.message)); }, [notify]);
  useEffect(() => () => clearInterval(timer.current), []);

  function poll(paymentId) {
    let tries = 0;
    clearInterval(timer.current);
    timer.current = setInterval(async () => {
      tries++;
      try {
        const r = await api(`/payments/${paymentId}/status`);
        if (r.status === 'success') {
          clearInterval(timer.current); setState('success');
          setMessage(r.receipt ? `Payment received. Receipt ${r.receipt}.` : 'Payment received.');
          setTimeout(() => navigate('/dashboard'), 2500);
        } else if (r.status === 'failed') {
          clearInterval(timer.current); setState('failed');
          setMessage(r.message || 'The payment was not completed.');
        }
      } catch { /* keep trying */ }
      if (tries >= 30) {
        clearInterval(timer.current); setState('failed');
        setMessage('We have not received your payment yet. If you paid, your plan will activate shortly. Check your dashboard.');
      }
    }, 3000);
  }

  async function pay(e) {
    e.preventDefault();
    setState('sending'); setMessage('');
    try {
      const { paymentId } = await api('/payments/stk', { method: 'POST', body: { plan: chosen.id, phone } });
      setState('waiting');
      poll(paymentId);
    } catch (err) { setState('failed'); setMessage(err.message); }
  }

  function choose(plan) {
    if (!user) return navigate('/signup');
    setChosen(plan); setState('idle'); setMessage('');
  }

  return (
    <main className="page-shell">
      <div className="page-title">
        <span className="eyebrow">PRICING</span>
        <h1>Rent Reverse for your sales team.</h1>
        <p>Every new company starts with a 14-day free trial. Pay with M-Pesa when you are ready. Longer plans cost less per month.</p>
      </div>

      <div className="category-grid">
        {plans.map(p => (
          <div className="category-card" key={p.id} style={{ display: 'block' }}>
            <h3>{p.label}</h3>
            <div className="price-big">{money(p.amount)}</div>
            <p>{p.days} days of access{p.savePercent ? ` · save ${p.savePercent}%` : ''}</p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => choose(p)}>
              {user ? 'Pay with M-Pesa' : 'Start free trial'}
            </button>
          </div>
        ))}
      </div>

      {chosen && (
        <form className="form-card" style={{ marginTop: 24 }} onSubmit={pay}>
          <h3>{chosen.label} plan · {money(chosen.amount)}</h3>
          <div className="field">
            <label>M-Pesa phone number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} required placeholder="0712345678" disabled={state === 'sending' || state === 'waiting'} />
          </div>
          {state === 'waiting' && <div className="notice">Check your phone and enter your M-Pesa PIN to approve the payment…</div>}
          {state === 'success' && <div className="notice">{message} Taking you to your dashboard…</div>}
          {state === 'failed' && <div className="notice">{message}</div>}
          <div className="form-actions">
            <button className="btn btn-primary btn-lg" disabled={state === 'sending' || state === 'waiting' || state === 'success'}>
              {state === 'sending' ? 'Sending request…' : `Pay ${money(chosen.amount)} →`}
            </button>
          </div>
        </form>
      )}
      {!user && <p style={{ marginTop: 16 }}>Already have an account? <Link to="/login" style={{ color: '#6d28d9', fontWeight: 800 }}>Log in</Link></p>}
    </main>
  );
}
