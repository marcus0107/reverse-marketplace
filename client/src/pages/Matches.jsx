import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, money, TOKEN_KEY } from '../api';
import { Empty, ErrorBox, Loading } from '../components/Status.jsx';

export default function Matches() {
  const [params] = useSearchParams();
  const token = params.get('r') || localStorage.getItem(TOKEN_KEY);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minMatch, setMinMatch] = useState(60);

  useEffect(() => {
    if (!token) return;
    api('/requests/' + encodeURIComponent(token))
      .then(d => { setData(d); setMaxPrice(Math.round(d.request.budget * 1.2)); })
      .catch(e => setError(e.message));
  }, [token]);

  if (!token) return (
    <main className="page-shell"><div className="notice">You have no request yet. <Link to="/request">Post a buyer need</Link> to see matches.</div></main>
  );
  if (error) return <main className="page-shell"><ErrorBox message={error} onRetry={() => window.location.reload()} /><p><Link to="/request">Post a new buyer need</Link></p></main>;
  if (!data) return <main className="page-shell"><Loading text="Finding your matches…" /></main>;

  const { request: r, matches } = data;
  const list = matches.filter(m => m.price <= (Number(maxPrice) || Infinity) && m.score >= minMatch);

  return (
    <main className="page-shell match-page">
      <div className="page-title">
        <span className="eyebrow">YOUR MATCHES</span>
        <h1>Companies that fit your need.</h1>
        <p><b>{r.title}</b> · Budget <b>{money(r.budget)}</b> · Need by <b>{r.deadline}</b></p>
      </div>
      <div className="matches-layout">
        <aside className="filters">
          <h3>Compare by</h3>
          <div className="filter-row"><label>Maximum price</label><input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} /></div>
          <div className="filter-row"><label>Minimum match: {minMatch}%</label><input type="range" min="50" max="100" value={minMatch} onChange={e => setMinMatch(Number(e.target.value))} /></div>
          <div className="notice">Ranking considers category, location, budget fit and your keywords — not price alone.</div>
        </aside>
        <section className="results">
          {!list.length && (matches.length === 0
            ? <Empty title="No companies matched yet">Companies join every day. Try posting again with a higher budget or a different category, and we will look again.<br /><Link className="btn btn-primary" to="/request">Post another need</Link></Empty>
            : <div className="notice">No companies match these filters. Try raising the maximum price or lowering the minimum match.</div>)}
          {list.map(c => (
            <article className="result-card" key={c.id}>
              <img src={c.image || '/logo/logo.png'} alt={c.name} />
              <div>
                <span className="mini-label">{c.name}</span>
                <h3>{c.category} · {c.location}</h3>
                <p>{c.description}</p>
                <div className="tags"><span className="tag">★ {c.rating}</span><span className="tag">{c.location}</span><span className="tag">{c.category}</span></div>
              </div>
              <div className="match-score">
                <strong>{c.score}%</strong><span>match</span><b>{money(c.price)}</b>
                <Link className="btn btn-primary" to={`/company/${c.id}?r=${token}`}>View company</Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
