import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api';

export default function Home() {
  const [plans, setPlans] = useState([]);
  useEffect(() => { api('/payments/plans').then(setPlans).catch(() => {}); }, []);

  return (
    <main>

    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow">FOR SELLING COMPANIES</div>
        <h1>Rent a sales channel.<br /><span>Match buyers automatically.</span></h1>
        <p>Seller companies subscribe to the platform, get matched to buyer requirements, and receive direct lead alerts when a request fits their offering.</p>
        <div className="hero-actions">
          <Link className="btn btn-primary btn-lg" to="/request">Post a buyer need <span>→</span></Link>
          <Link className="btn btn-light btn-lg" to="/signup">Join as a seller</Link>
          <a className="btn btn-light btn-lg" href="#how-it-works">See how it works</a>
        </div>
        <div className="trust-row"><span>✓ Qualified buyer leads</span><span>✓ Automated matching</span><span>✓ Better conversion</span></div>
        <p style={{ marginTop: 22, fontSize: 15 }}>Looking to buy something? <Link to="/request" style={{ fontWeight: 800 }}>Post what you need</Link>. It is free and needs no account.</p>
      </div>

      <div className="match-preview glass-card">
        <div className="preview-head"><div><span className="mini-label">EXAMPLE MATCH</span><h3><span className="inline-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><rect x="3.5" y="6" width="13" height="10" rx="1.5"/><path d="M8.5 18.5h4.5M7 15h10"/><path d="M16.5 9h3.2a1.3 1.3 0 0 1 1.3 1.3v3.4a1.3 1.3 0 0 1-1.3 1.3h-3.2"/></svg></span> Laptop for university</h3></div><span className="status-dot">● 4 offers</span></div>
        <div className="request-summary"><span>Budget <b>KSh 70,000</b></span><span>Need by <b>3 days</b></span></div>
        <div className="offer-list">
          <article className="offer-row top-offer"><img src="https://images.pexels.com/photos/11026522/pexels-photo-11026522.jpeg?auto=compress&cs=tinysrgb&w=160" alt="Laptop" /><div className="offer-info"><b>TechHub Kenya</b><small>ThinkPad T14 · 16GB · 512GB</small></div><div className="offer-price"><strong>KSh 64,000</strong><em>96% match</em></div></article>
          <article className="offer-row"><img src="https://images.pexels.com/photos/19012034/pexels-photo-19012034.jpeg?auto=compress&cs=tinysrgb&w=160" alt="Laptop setup" /><div className="offer-info"><b>Laptop World</b><small>EliteBook · 16GB · 512GB</small></div><div className="offer-price"><strong>KSh 59,000</strong><em>92% match</em></div></article>
          <article className="offer-row"><img src="https://images.pexels.com/photos/16770313/pexels-photo-16770313.jpeg?auto=compress&cs=tinysrgb&w=160" alt="Laptop desk" /><div className="offer-info"><b>Digital Store</b><small>IdeaPad · 16GB · 512GB</small></div><div className="offer-price"><strong>KSh 48,000</strong><em>84% match</em></div></article>
        </div>
        <Link className="preview-link" to="/matches">View all matches →</Link>
      </div>
    </section>

    <section className="stats-strip"><div><strong>1</strong><span>request</span></div><div><strong>3+</strong><span>offers to compare</span></div><div><strong>1</strong><span>best-fit choice</span></div></section>

    <section id="how-it-works" className="section section-white">
      <div className="section-heading"><span className="eyebrow">HOW IT WORKS</span><h2>Built for selling companies.</h2><p>Buyers submit requirements, the platform filters seller companies, and matched vendors receive a buyer alert to reach out directly.</p></div>
      <div className="steps">
        <article className="step"><span className="step-number">01</span><div className="step-icon"><svg viewBox="0 0 24 24" focusable="false"><path d="M7.5 4.5h6.2l4.8 4.8v9a2.7 2.7 0 0 1-2.7 2.7H9.2A2.7 2.7 0 0 1 6.5 18.3v-10A2.7 2.7 0 0 1 9.2 5.6h-1.7z"/><path d="M13.7 4.5v4.4h4.4"/><path d="M9.1 12.3h6.1M9.1 15.3h5.5"/><path d="M9 9.3h2.1"/></svg></div><h3>Buyer shares a need</h3><p>The buyer describes the product, budget, deadline and location they need.</p></article>
        <article className="step"><span className="step-number">02</span><div className="step-icon"><svg viewBox="0 0 24 24" focusable="false"><circle cx="10.5" cy="10.5" r="5.6"/><path d="M15.1 15.1L19 19"/><path d="M10.5 7.6v3.1l2.3 1.8"/><path d="M7.3 10.5h6.4" opacity=".3"/></svg></div><h3>System matches companies</h3><p>Reverse compares the request against the qualifications of registered seller companies.</p></article>
        <article className="step"><span className="step-number">03</span><div className="step-icon"><svg viewBox="0 0 24 24" focusable="false"><circle cx="7.2" cy="17.6" r="2.1"/><circle cx="16.8" cy="17.6" r="2.1"/><circle cx="12" cy="9" r="2.7"/><path d="M8.7 15.1l2.2-3.9 2.4 3.3 2.4-3.1"/><path d="M7.2 12.4h9.6" opacity=".25"/></svg></div><h3>Matched sellers get notified</h3><p>Only relevant companies receive a buyer lead alert and can respond with their offer.</p></article>
        <article className="step"><span className="step-number">04</span><div className="step-icon"><svg viewBox="0 0 24 24" focusable="false"><path d="M12 3.8l2.4 5.1 5.7.9-4.1 4.1 1 5.8-5-2.6-5 2.6 1-5.8-4.1-4.1 5.7-.9L12 3.8z"/><path d="M12 8.3v7.8" opacity=".2"/></svg></div><h3>Seller approaches buyer</h3><p>Once matched, the company reaches out to the buyer with a tailored offer.</p></article>
      </div>
    </section>

    <section id="categories" className="section section-tint">
      <div className="section-heading"><span className="eyebrow">ONE PLATFORM, MANY NEEDS</span><h2>What do you need?</h2></div>
      <div className="category-grid">
        <Link className="category-card" to="/request?category=Products"><span><svg viewBox="0 0 24 24" focusable="false"><path d="M6 8.8h12l-1.1 9.3A2 2 0 0 1 15 20H9a2 2 0 0 1-2-1.9L6 8.8z"/><path d="M9 8.8V7.5A3 3 0 0 1 12 4.6a3 3 0 0 1 3 2.9v1.3"/><path d="M9.4 12.1h5.2"/><path d="M9.6 15.1h4.8"/></svg></span><div><h3>Products</h3><p>Phones, laptops, furniture, appliances and more.</p></div><b>→</b></Link>
        <Link className="category-card" to="/request?category=Services"><span><svg viewBox="0 0 24 24" focusable="false"><rect x="6.2" y="5.8" width="11.6" height="12.6" rx="2.2"/><path d="M9.2 9.8h5.6M9.2 12.3h5.6M9.2 14.9h3.9"/><path d="M10.2 18.5l-1.2 1.8h6.2l-1.2-1.8"/></svg></span><div><h3>Services</h3><p>Repairs, design, tutoring, cleaning and professional help.</p></div><b>→</b></Link>
        <Link className="category-card" to="/request?category=Custom Work"><span><svg viewBox="0 0 24 24" focusable="false"><path d="M5.4 15.2l4.3-4.2 3.2 3.1 6.7-6.9"/><path d="M16.7 7.2h3.2v3.2"/><path d="M6 18.5h12"/><path d="M7.4 12.8h4.9" opacity=".2"/></svg></span><div><h3>Custom Work</h3><p>Made-to-order items, creative work and special projects.</p></div><b>→</b></Link>
        <Link className="category-card" to="/request?category=Business"><span><svg viewBox="0 0 24 24" focusable="false"><path d="M5 18V9.7A1.7 1.7 0 0 1 6.7 8h10.6A1.7 1.7 0 0 1 19 9.7V18"/><path d="M5 13.6h14"/><path d="M8.4 8V6.8A2.8 2.8 0 0 1 11.2 4h1.6a2.8 2.8 0 0 1 2.8 2.8V8"/><path d="M10.8 16.5h2.4"/><path d="M12 8.5v5.5" opacity=".2"/></svg></span><div><h3>Business</h3><p>Procurement, bulk orders and supplier sourcing.</p></div><b>→</b></Link>
      </div>
    </section>

    <section id="why" className="section why-section">
      <div className="why-copy"><span className="eyebrow">WHY COMPANIES RENT REVERSE</span><h2>More leads, fewer wasted sales calls.</h2><p>Seller companies pay to access a marketplace where demand is filtered by relevance. Instead of chasing every buyer, they only get notified when a request matches their categories, capabilities and price range.</p><div className="score-explain"><div><strong>96%</strong><span>buyer fit</span></div><div className="score-bar"><i style={{ width: '96%' }}></i></div><ul><li>Product fit</li><li>Company capability</li><li>Budget alignment</li><li>Delivery timing</li></ul></div></div>
      <div className="why-image"><img src="https://images.pexels.com/photos/18721087/pexels-photo-18721087.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Business and technology workspace" /></div>
    </section>

    <section id="pricing" className="section section-white">
      <div className="section-heading"><span className="eyebrow">PRICING</span><h2>Simple plans for sellers.</h2><p>Start with a 14-day free trial. Pay with M-Pesa when you are ready. Buyers always post for free.</p></div>
      <div className="category-grid">
        {plans.map(p => (
          <div className="category-card" key={p.id} style={{ display: 'block' }}>
            <h3>{p.label}</h3>
            <div className="price-big">{money(p.amount)}</div>
            <p>{p.days} days of access{p.savePercent ? ` · save ${p.savePercent}%` : ''}</p>
            <Link className="btn btn-primary" style={{ width: '100%', marginTop: 14 }} to="/pricing">Choose plan</Link>
          </div>
        ))}
      </div>
    </section>

    <section className="cta-section"><div><span className="eyebrow light">READY TO RENT?</span><h2>Let buyer needs come to your sales team.</h2><p>When the platform finds a match, your company is notified and can approach the buyer quickly.</p></div><Link className="btn btn-white btn-lg" to="/signup">Join as a seller →</Link></section>
  
    </main>
  );
}
