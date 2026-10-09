import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, CATEGORIES, TOKEN_KEY } from '../api';
import { useApp } from '../context.jsx';

export default function Request() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { notify } = useApp();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    buyerName: '', buyerPhone: '', buyerEmail: '', title: '',
    category: CATEGORIES.includes(params.get('category')) ? params.get('category') : 'Products',
    budget: '', deadline: '', location: '', description: ''
  });
  const set = e => setF({ ...f, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { token } = await api('/requests', { method: 'POST', body: { ...f, deadline: f.deadline || 'Flexible' } });
      localStorage.setItem(TOKEN_KEY, token);
      notify('Request posted! Finding matching companies…');
      navigate('/matches?r=' + token);
    } catch (err) { notify(err.message); setBusy(false); }
  }

  return (
    <main className="page-shell">
      <div className="page-title">
        <span className="eyebrow">POST A REQUEST</span>
        <h1>Tell the market what you need.</h1>
        <p>Add a phone or email so matched companies can reach you. Be specific — the better your request, the better the offers.</p>
      </div>
      <form className="form-card" onSubmit={submit}>
        <div className="form-grid">
          <div className="field"><label>Your name</label><input name="buyerName" value={f.buyerName} onChange={set} required placeholder="Your full name" /></div>
          <div className="field"><label>Phone</label><input name="buyerPhone" type="tel" value={f.buyerPhone} onChange={set} placeholder="07xx xxx xxx" /></div>
          <div className="field full"><label>Email</label><input name="buyerEmail" type="email" value={f.buyerEmail} onChange={set} placeholder="you@example.com" /></div>
          <div className="field full"><label>What do you need?</label><input name="title" value={f.title} onChange={set} required placeholder="e.g. Laptop for university and programming" /></div>
          <div className="field"><label>Category</label>
            <select name="category" value={f.category} onChange={set}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
          <div className="field"><label>Maximum budget (KSh)</label><input name="budget" type="number" min="1" value={f.budget} onChange={set} required placeholder="70000" /></div>
          <div className="field"><label>Need it by</label><input name="deadline" type="date" value={f.deadline} onChange={set} /></div>
          <div className="field"><label>Location</label><input name="location" value={f.location} onChange={set} placeholder="e.g. Nairobi" /></div>
          <div className="field full"><label>Describe your requirements</label>
            <textarea name="description" value={f.description} onChange={set} required placeholder="Size, quality, features, preferred brand, delivery needs…" /></div>
        </div>
        <div className="form-actions"><button className="btn btn-primary btn-lg" type="submit" disabled={busy}>{busy ? 'Matching…' : 'Find my matches →'}</button></div>
      </form>
    </main>
  );
}
