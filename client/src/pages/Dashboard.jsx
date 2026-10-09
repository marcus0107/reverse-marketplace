import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, money } from '../api';
import { useApp } from '../context.jsx';
import { Empty, ErrorBox, Loading } from '../components/Status.jsx';

const STATUSES = ['new', 'contacted', 'won', 'lost'];

export default function Dashboard() {
  const { notify } = useApp();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    return api('/companies/me/dashboard').then(setData).catch(e => (e.status === 401 ? navigate('/login') : setError(e.message)));
  }, [navigate]);
  useEffect(() => { load(); }, [load]);

  async function setStatus(id, status) {
    try { await api('/companies/me/leads/' + id, { method: 'PATCH', body: { status } }); notify('Lead updated'); load(); }
    catch (e) { notify(e.message); }
  }

  if (error) return <main className="page-shell"><ErrorBox message={error} onRetry={load} /></main>;
  if (!data) return <main className="page-shell"><Loading text="Loading your dashboard…" /></main>;
  const { company, stats, leads } = data;
  const ends = company.subscriptionEnds ? new Date(company.subscriptionEnds).toLocaleDateString('en-KE') : '';

  return (
    <main className="page-shell">
      <div className="page-title">
        <span className="eyebrow">{company.name}</span>
        <h1>See which buyers fit your business.</h1>
        <p>Each new buyer request is matched against your company profile, then appears here as a lead so you can approach the buyer quickly.</p>
      </div>
      <div className="notice">
        {company.subscriptionActive
          ? <>Plan: <b>{company.subscriptionStatus}</b>{ends && ` · active until ${ends}`}</>
          : <><b>Your subscription has expired.</b> Renew to receive new leads and see buyer contact details.</>}
        {' '}<Link to="/pricing" style={{ fontWeight: 800 }}>{company.subscriptionActive ? 'Extend plan' : 'Renew now'}</Link>
        {' · '}<Link to="/listing" style={{ fontWeight: 800 }}>Edit listing</Link>
      </div>
      <div className="dashboard-grid">
        <div className="dash-stat"><span className="mini-label">NEW LEADS</span><strong>{stats.newThisWeek}</strong><small>This week</small></div>
        <div className="dash-stat"><span className="mini-label">CONTACTED</span><strong>{stats.contacted}</strong><small>Leads you have approached</small></div>
        <div className="dash-stat"><span className="mini-label">CONVERSION</span><strong>{stats.conversion}%</strong><small>Leads marked won</small></div>
        <div className="dash-stat"><span className="mini-label">AVG. FIT</span><strong>{stats.avgFit ? stats.avgFit + '%' : '–'}</strong><small>Across matched requests</small></div>
        <div className="dash-stat dash-list">
          <h3>Matched buyer requests</h3>
          {!leads.length && <Empty title="No matched buyers yet">When a buyer posts a need that fits your listing, it shows up here and we email you. A complete listing gets more matches.<br /><Link className="btn btn-primary" to="/listing">Improve my listing</Link></Empty>}
          {leads.map(l => (
            <div className="dash-request" key={l.id}>
              <div>
                <b>{l.title}</b>
                <div className="muted">{l.category} · {money(l.budget)} · {l.location} · needs by {l.deadline}</div>
                <div className="muted">
                  {l.buyer_name
                    ? [l.buyer_name, l.buyer_phone, l.buyer_email].filter(Boolean).join(' · ')
                    : 'Buyer contact hidden — renew your subscription'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="tag">{l.score}% fit</span>
                <select value={l.status} onChange={e => setStatus(l.id, e.target.value)}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
