import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api, money } from '../api';
import { useApp } from '../context.jsx';
import { Loading } from '../components/Status.jsx';
import '../admin.css';

const TABS = [['overview', 'Overview'], ['companies', 'Companies'], ['payments', 'Payments'], ['requests', 'Buyer requests']];
const date = d => (d ? new Date(d).toLocaleDateString('en-KE') : '–');
const dateTime = d => (d ? new Date(d).toLocaleString('en-KE') : '–');

function companyState(c) {
  if (c.suspended) return ['suspended', 'bad'];
  if (c.ends && new Date(c.ends) < new Date(new Date().toDateString())) return ['expired', 'bad'];
  return [c.status, c.status === 'active' ? 'good' : 'warn'];
}

export default function Admin() {
  const { user, notify } = useApp();
  const [tab, setTab] = useState('overview');
  const [loaded, setLoaded] = useState({ tab: null, data: null });
  // Only show data that belongs to the tab being displayed (each tab returns a different shape)
  const data = loaded.tab === tab ? loaded.data : null;

  const load = useCallback(async () => {
    setLoaded({ tab: null, data: null });
    try { setLoaded({ tab, data: await api('/admin/' + tab) }); } catch (e) { notify(e.message); }
  }, [tab, notify]);
  useEffect(() => { if (user && user.isAdmin) load(); }, [user, load]);

  if (!user || !user.isAdmin) return <Navigate to="/" replace />;

  async function act(id, body, okMsg) {
    try { await api('/admin/companies/' + id, { method: 'PATCH', body }); notify(okMsg); load(); }
    catch (e) { notify(e.message); }
  }

  return (
    <main className="page-shell">
      <div className="page-title"><span className="eyebrow">ADMIN</span><h1>Platform control.</h1></div>
      <div className="admin-tabs">
        {TABS.map(([id, label]) => <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{label}</button>)}
      </div>

      {!data && <Loading />}

      {data && tab === 'overview' && (
        <div className="dashboard-grid">
          <div className="dash-stat"><span className="mini-label">COMPANIES</span><strong>{data.companies}</strong><small>{data.active} paying · {data.trial} on trial · {data.suspended} suspended</small></div>
          <div className="dash-stat"><span className="mini-label">BUYER REQUESTS</span><strong>{data.requests}</strong><small>{data.matches} matches made</small></div>
          <div className="dash-stat"><span className="mini-label">REVENUE (TOTAL)</span><strong>{money(data.revenueTotal)}</strong><small>{data.paymentsCount} successful payments</small></div>
          <div className="dash-stat"><span className="mini-label">REVENUE (THIS MONTH)</span><strong>{money(data.revenueMonth)}</strong><small>{data.pendingPayments} payments pending</small></div>
        </div>
      )}

      {data && tab === 'companies' && (
        <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>Company</th><th>Email</th><th>Category</th><th>Plan</th><th>Ends</th><th>Leads</th><th>Actions</th></tr></thead>
          <tbody>{data.map(c => {
            const [label, tone] = companyState(c);
            return (
              <tr key={c.id}>
                <td><b>{c.name}</b><br /><small>{c.location}</small></td>
                <td>{c.email}</td><td>{c.category}</td>
                <td><span className={'pill ' + tone}>{label}</span></td>
                <td>{date(c.ends)}</td><td>{c.leads}</td>
                <td><div className="admin-actions">
                  <button onClick={() => act(c.id, { addDays: 30 }, '30 days added')}>+30 days</button>
                  <button className={c.suspended ? '' : 'danger'} onClick={() => act(c.id, { suspended: !c.suspended }, c.suspended ? 'Company restored' : 'Company suspended')}>
                    {c.suspended ? 'Restore' : 'Suspend'}
                  </button>
                </div></td>
              </tr>);
          })}</tbody>
        </table></div>
      )}

      {data && tab === 'payments' && (
        <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>When</th><th>Company</th><th>Plan</th><th>Amount</th><th>Phone</th><th>Status</th><th>Receipt / note</th></tr></thead>
          <tbody>{data.map(p => (
            <tr key={p.id}>
              <td>{dateTime(p.created_at)}</td><td>{p.company}</td><td>{p.plan}</td><td>{money(p.amount)}</td><td>{p.phone}</td>
              <td><span className={'pill ' + (p.status === 'success' ? 'good' : p.status === 'pending' ? 'warn' : 'bad')}>{p.status}</span></td>
              <td className="wrap">{p.receipt || p.note || '–'}</td>
            </tr>))}
            {!data.length && <tr><td colSpan="7">No payments yet.</td></tr>}
          </tbody>
        </table></div>
      )}

      {data && tab === 'requests' && (
        <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>When</th><th>Request</th><th>Category</th><th>Budget</th><th>Location</th><th>Matches</th></tr></thead>
          <tbody>{data.map(r => (
            <tr key={r.id}>
              <td>{dateTime(r.created_at)}</td><td className="wrap">{r.title}</td><td>{r.category}</td><td>{money(r.budget)}</td><td>{r.location}</td><td>{r.matches}</td>
            </tr>))}
            {!data.length && <tr><td colSpan="6">No requests yet.</td></tr>}
          </tbody>
        </table></div>
      )}
    </main>
  );
}
