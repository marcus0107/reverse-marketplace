import { Link, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { useApp } from './context.jsx';
import Home from './pages/Home.jsx';
import Request from './pages/Request.jsx';
import Matches from './pages/Matches.jsx';
import Company from './pages/Company.jsx';
import { Login, Signup } from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Listing from './pages/Listing.jsx';
import { Loading } from './components/Status.jsx';
import Pricing from './pages/Pricing.jsx';
import Admin from './pages/Admin.jsx';
import { ForgotPassword, ResetPassword } from './pages/ResetPassword.jsx';

function Protected({ children }) {
  const { user } = useApp();
  if (user === undefined) return <main className="page-shell"><Loading /></main>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/request" element={<Request />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/company/:id" element={<Company />} />
        <Route path="/admin" element={<Protected><Admin /></Protected>} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/listing" element={<Protected><Listing /></Protected>} />
        <Route path="*" element={<main className="page-shell"><div className="page-title"><span className="eyebrow">404</span><h1>We could not find that page.</h1><p>The link may be old or mistyped.</p><Link className="btn btn-primary btn-lg" to="/">Back to home</Link></div></main>} />
      </Route>
    </Routes>
  );
}
