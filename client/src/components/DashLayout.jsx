import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context.jsx';
import { pageTitle } from '../titles';
import ThemeToggle from './ThemeToggle.jsx';

const Icon = ({ d }) => <svg viewBox="0 0 24 24" aria-hidden="true">{d}</svg>;
const ICONS = {
  dashboard: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.6" /></>,
  listing: <><path d="M4 9l1.5-4.5h13L20 9" /><path d="M5 9v10.5h14V9" /><path d="M9.5 19.5v-5h5v5" /></>,
  billing: <><rect x="3" y="5.5" width="18" height="13" rx="2.2" /><path d="M3 10h18" /><path d="M7 15h4" /></>
};

// The signed-in company area: sidebar on the left, page on the right
export default function DashLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useApp();
  const [open, setOpen] = useState(false); // phone: sidebar slid in
  const [collapsed, setCollapsed] = useState(() => { try { return localStorage.getItem('reverse_dash_collapsed') === '1'; } catch { return false; } });

  // Phone: slide the sidebar in. Computer: hide or show it for more room.
  const toggleSide = () => {
    if (window.matchMedia('(max-width: 900px)').matches) setOpen(o => !o);
    else setCollapsed(c => { try { localStorage.setItem('reverse_dash_collapsed', c ? '0' : '1'); } catch { /* ignore */ } return !c; });
  };

  useEffect(() => {
    document.body.className = 'app-page';
    document.title = pageTitle(pathname) + ' | Reverse';
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  const out = async () => { await logout(); navigate('/'); };

  return (
    <div className={'dash-layout' + (collapsed ? ' collapsed' : '')}>
      <aside className={'dash-side' + (open ? ' open' : '')}>
        <Link className="dash-brand" to="/"><img src="/logo/logo.png" alt="" /> REVERSE</Link>
        <div className="dash-company"><span>Signed in as</span><b>{user && (user.name || user.email)}</b></div>
        <nav className="dash-nav">
          <NavLink to="/dashboard"><Icon d={ICONS.dashboard} /> Dashboard</NavLink>
          <NavLink to="/listing"><Icon d={ICONS.listing} /> My listing</NavLink>
          <NavLink to="/billing"><Icon d={ICONS.billing} /> Plans &amp; billing</NavLink>
        </nav>
        <div className="dash-foot">
          <Link to="/">← Public site</Link>
          <button onClick={out}>Log out</button>
        </div>
      </aside>
      {open && <div className="dash-scrim" onClick={() => setOpen(false)} />}
      <div className="dash-main">
        <header className="dash-top">
          <button className="dash-burger" aria-label="Show or hide menu" onClick={toggleSide}>☰</button>
          <b>{pageTitle(pathname)}</b>
          <span className="dash-top-gap" />
          <ThemeToggle />
        </header>
        <Outlet />
      </div>
    </div>
  );
}
