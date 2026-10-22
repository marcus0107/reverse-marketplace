import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { pageTitle } from '../titles';
import ThemeToggle from './ThemeToggle.jsx';

// Login, signup and password pages: split-screen look with no public menu
export default function AuthLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.body.className = 'auth-page';
    document.title = pageTitle(pathname) + ' | Reverse';
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="auth-split">
      <aside className="auth-brand">
        <Link className="auth-logo" to="/"><img src="/logo/logo.png" alt="" /> REVERSE</Link>
        <div className="auth-copy">
          <h2>Let buyer needs come to your sales team.</h2>
          <ul className="auth-points">
            <li>Matched buyer leads arrive on your dashboard</li>
            <li>An email alert the moment a buyer fits your business</li>
            <li>Start with a 14-day free trial, then pay with M-Pesa</li>
          </ul>
        </div>
        <small className="auth-foot">© 2026 Reverse Marketplace</small>
      </aside>
      <div className="auth-pane">
        <div className="auth-top"><Link className="auth-back" to="/">← Back to home</Link><ThemeToggle /></div>
        <Outlet />
      </div>
    </div>
  );
}
