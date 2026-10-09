import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api, money } from '../api';
import { ErrorBox, Loading } from '../components/Status.jsx';

export default function Company() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const r = params.get('r');
  const [c, setC] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/companies/${id}` + (r ? `?r=${encodeURIComponent(r)}` : '')).then(setC).catch(e => setError(e.message));
  }, [id, r]);

  if (error) return <main className="page-shell"><ErrorBox message={error} /><p><Link to="/matches">← Back to matches</Link></p></main>;
  if (!c) return <main className="page-shell"><Loading /></main>;

  return (
    <main className="page-shell">
      <div className="offer-page">
        <section className="offer-hero">
          <img src={c.image || '/logo/logo.png'} alt={c.name} />
          <span className="mini-label">COMPANY PROFILE</span>
          <h1>{c.name}</h1>
          <p className="muted">{c.category} · {c.location}</p>
        </section>
        <section className="offer-info-card">
          <span className="rating">★ {c.rating} company rating</span>
          <div className="price-big">{money(c.price)}</div>
          <span className="tag">{c.score != null ? `${c.score}% match` : 'Verified company'}</span>
          <p style={{ lineHeight: 1.7, color: '#6f6a7d' }}>{c.description}</p>
          <div className="detail-list">
            <div><span>Delivery</span><b>{c.delivery}</b></div>
            <div><span>Condition</span><b>{c.condition}</b></div>
            <div><span>Payment</span><b>Agreed with the company</b></div>
          </div>
          <div className="notice">This company has been alerted about your request and can contact you directly using the details you shared.</div>
          <Link className="btn btn-primary btn-lg" style={{ width: '100%' }} to={r ? `/matches?r=${r}` : '/matches'}>← Back to matches</Link>
        </section>
      </div>
    </main>
  );
}
