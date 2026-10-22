import { useEffect, useState } from 'react';
import { currentTheme, setTheme } from '../theme.js';

const Moon = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" /></svg>;
const Sun = <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" /></svg>;

export default function ThemeToggle() {
  const [theme, setLocal] = useState(currentTheme);
  useEffect(() => {
    const sync = () => setLocal(currentTheme());
    sync();
    window.addEventListener('reverse-theme', sync);
    return () => window.removeEventListener('reverse-theme', sync);
  }, []);
  const dark = theme === 'dark';
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  return <button className="theme-toggle" onClick={() => setTheme(dark ? 'light' : 'dark')} aria-label={label} title={label}>{dark ? Sun : Moon}</button>;
}
