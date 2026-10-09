import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, CATEGORIES } from '../api';
import { useApp } from '../context.jsx';
import { Loading } from '../components/Status.jsx';

export default function Listing() {
  const navigate = useNavigate();
  const { notify } = useApp();
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = e => setF({ ...f, [e.target.name]: e.target.value });

  useEffect(() => {
    api('/companies/me/dashboard').then(({ company: c }) => setF({
      name: c.name, category: c.category, location: c.location, price: c.price || '',
      delivery: c.delivery || '3-5 days', condition: c.condition || 'New', description: c.description || ''
    })).catch(e => (e.status === 401 ? navigate('/login') : notify(e.message)));
  }, [notify, navigate]);

  async function submit(e) {
    e.preventDefault(); setBusy(true);
    try { await api('/companies/me', { method: 'PUT', body: f }); notify('Company listing saved!'); navigate('/dashboard'); }
    catch (err) { notify(err.message); setBusy(false); }
  }

  if (!f) return <main className="page-shell"><Loading /></main>;
  return (
    <main className="page-shell">
      <div className="page-title">
        <span className="eyebrow">SELLER COMPANY LISTING</span>
        <h1>List your company and get matched to buyer needs.</h1>
        <p>Share your offering, pricing and delivery capacity so the platform can notify you when a buyer matches.</p>
      </div>
      <form className="form-card" onSubmit={submit}>
        <div className="form-grid">
          <div className="field"><label>Company / product name</label><input name="name" value={f.name} onChange={set} required /></div>
          <div className="field"><label>Category</label><select name="category" value={f.category} onChange={set}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
          <div className="field"><label>Location</label><input name="location" value={f.location} onChange={set} placeholder="Nairobi" /></div>
          <div className="field"><label>Typical price (KSh)</label><input name="price" type="number" min="1" value={f.price} onChange={set} required placeholder="64000" /></div>
          <div className="field"><label>Delivery time</label>
            <select name="delivery" value={f.delivery} onChange={set}>{['Same day', '1 day', '2 days', '3-5 days'].map(d => <option key={d}>{d}</option>)}</select></div>
          <div className="field"><label>Condition</label>
            <select name="condition" value={f.condition} onChange={set}>{['New', 'Refurbished', 'Used — excellent'].map(d => <option key={d}>{d}</option>)}</select></div>
          <div className="field full"><label>Company offer details</label>
            <textarea name="description" value={f.description} onChange={set} required placeholder="Product range, service scope, warranty, experience, quality standards…" /></div>
        </div>
        <div className="form-actions"><button className="btn btn-primary btn-lg" disabled={busy}>{busy ? 'Saving…' : 'Save company listing →'}</button></div>
      </form>
    </main>
  );
}
