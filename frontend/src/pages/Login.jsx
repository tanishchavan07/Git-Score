import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy]         = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const { ok } = await login(email, password);
    setBusy(false);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="container" style={centered}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: 420 }}
      >
        <h2 style={{ marginBottom: 8, textAlign: 'center', fontSize: '1.8rem' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', marginBottom: 32, color: 'var(--text-secondary)' }}>
          Login to access your dashboard & analytics
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email" className="input-field"
              placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password" className="input-field"
              placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={busy}>
            <LogIn size={18} /> {busy ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
          No account? <Link to="/register" style={{ color: 'var(--accent-purple)' }}>Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
};

const centered = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' };
export default Login;
