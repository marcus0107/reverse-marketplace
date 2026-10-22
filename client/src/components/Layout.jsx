import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context.jsx';
import { pageTitle } from '../titles';
import ThemeToggle from './ThemeToggle.jsx';

export default function Layout() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useApp();
  const [open, setOpen] = useState(false);
  const home = pathname === '/';
  const final = pathname === '/listing';

  useEffect(() => {
    document.title = pageTitle(pathname) + ' | Reverse';
  }, [pathname]);

  useEffect(() => {
    document.body.className = home ? 'home-page' : final ? 'final-page' : '';
    setOpen(false);
    if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView(), 60);
    else window.scrollTo(0, 0);
  }, [home, final, pathname, hash]);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const out = async () => { await logout(); setOpen(false); navigate('/'); };

  return (
    <>
      {(home || final) && <div className={'video-bg' + (final ? ' final-video-bg' : '')} aria-hidden="true" />}
      <header className="navbar">
        <Link className="brand" to="/"><img className="brand-mark brand-logo" src="/logo/logo.png" alt="Reverse logo" /> REVERSE</Link>
        <div className="nav-right">
          <ThemeToggle />
          <button className="menu-toggle" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>☰</button>
        </div>
      </header>

      {open && <div className="pub-scrim" onClick={() => setOpen(false)} />}
      <aside className={'pub-side' + (open ? ' open' : '')} aria-hidden={!open}>
        <div className="pub-side-head">
          <Link className="dash-brand" to="/"><img src="/logo/logo.png" alt="" /> REVERSE</Link>
          <button className="pub-close" aria-label="Close menu" onClick={() => setOpen(false)}>✕</button>
        </div>
        <nav className="dash-nav">
          <NavLink to="/" end>Home</NavLink>
          <Link to="/#how-it-works">How it works</Link>
          <NavLink to="/matches">My matches</NavLink>
          <NavLink to="/pricing">Pricing</NavLink>
          {user ? <NavLink to="/dashboard">Dashboard</NavLink> : <NavLink to="/login">Company login</NavLink>}
          {user && user.isAdmin ? <NavLink to="/admin">Admin</NavLink> : null}
        </nav>
        <div className="drawer-actions">
          <Link className="btn btn-primary" to="/request">Post a buyer need</Link>
          {user
            ? <button className="btn btn-light" onClick={out}>Log out</button>
            : <Link className="btn btn-light" to="/signup">Join as a seller</Link>}
        </div>
        <div className="dash-foot"><div className="drawer-theme"><span>Theme</span><ThemeToggle /></div></div>
      </aside>

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
