import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context.jsx';

export default function Layout() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useApp();
  const [open, setOpen] = useState(false);
  const home = pathname === '/';
  const final = pathname === '/listing';

  useEffect(() => {
    const titles = {
      '/': 'Reverse | Your need. Their offers. Your choice.', '/request': 'Post a buyer need | Reverse', '/matches': 'Your matches | Reverse',
      '/pricing': 'Pricing | Reverse', '/login': 'Company login | Reverse', '/signup': 'Join as a seller | Reverse',
      '/dashboard': 'Dashboard | Reverse', '/listing': 'Company listing | Reverse', '/admin': 'Admin | Reverse',
      '/forgot-password': 'Forgot password | Reverse', '/reset-password': 'New password | Reverse'
    };
    document.title = pathname.startsWith('/company/') ? 'Company profile | Reverse' : (titles[pathname] || 'Reverse');
  }, [pathname]);

  useEffect(() => {
    document.body.className = home ? 'home-page' : final ? 'final-page' : '';
    setOpen(false);
    if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView(), 60);
    else window.scrollTo(0, 0);
  }, [home, final, pathname, hash]);

  const out = async () => { await logout(); setOpen(false); navigate('/'); };

  return (
    <>
      {(home || final) && <div className={'video-bg' + (final ? ' final-video-bg' : '')} aria-hidden="true" />}
      <header className="navbar">
        <Link className="brand" to="/"><img className="brand-mark brand-logo" src="/logo/logo.png" alt="Reverse logo" /> REVERSE</Link>
        <nav>
          <NavLink to="/" end>Home</NavLink>
          <Link to="/#how-it-works">How it works</Link>
          <NavLink to="/matches">My matches</NavLink>
          <NavLink to="/pricing">Pricing</NavLink>
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          {user && user.isAdmin && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <div className="nav-actions">
          {user ? (
            <button className="btn btn-ghost" onClick={out}>Log out</button>
          ) : (
            <Link className="btn btn-ghost" to="/login">Company login</Link>
          )}
          <Link className="btn btn-primary" to="/request">Post a buyer need</Link>
          {!user && <Link className="btn btn-light" to="/signup">Join as a seller</Link>}
        </div>
        <button className="menu-toggle" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? '✕' : '☰'}</button>
      </header>

      {open && (
        <div className="mobile-menu">
          <Link to="/">Home</Link>
          <Link to="/#how-it-works">How it works</Link>
          <Link to="/matches">My matches</Link>
          <Link to="/pricing">Pricing</Link>
          {user && <Link to="/dashboard">Dashboard</Link>}
          {user && user.isAdmin && <Link to="/admin">Admin</Link>}
          {user
            ? <button className="menu-link" onClick={out}>Log out</button>
            : <Link to="/login">Company login</Link>}
          <Link className="btn btn-primary" to="/request">Post a buyer need</Link>
          {!user && <Link className="btn btn-light" to="/signup">Join as a seller</Link>}
        </div>
      )}

      <Outlet />
      <footer>
        <div className="footer-brand"><img className="brand-mark brand-logo" src="/logo/logo.png" alt="Reverse logo" /><b>REVERSE</b><p>Lead-matching for seller companies.</p></div>
        <div><b>Explore</b><Link to="/request">Post a buyer need</Link><Link to="/matches">My matches</Link></div>
        <div><b>For companies</b><Link to="/signup">Create account</Link><Link to="/dashboard">Company dashboard</Link><Link to="/login">Company login</Link></div>
        <div><b>Platform</b><span>Platform rental for sales teams.</span><span>Kenya · KSh pricing</span></div>
      </footer>
      <div className="copyright">© 2026 Reverse Marketplace · B2B lead matching</div>
    </>
  );
}
