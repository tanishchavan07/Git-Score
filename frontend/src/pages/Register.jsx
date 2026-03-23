import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const { ok } = await register(form.name, form.phone, form.email, form.password);
    setBusy(false);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="container" style={centered}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: 460 }}
      >
        <h2 style={{ marginBottom: 8, textAlign: 'center', fontSize: '1.8rem' }}>Create Account</h2>
        <p style={{ textAlign: 'center', marginBottom: 32, color: 'var(--text-secondary)' }}>
          Start analyzing GitHub profiles today
        </p>

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Full Name',  field: 'name',     type: 'text',     placeholder: 'John Doe' },
            { label: 'Phone',      field: 'phone',    type: 'text',     placeholder: '+91 XXXXXXXXXX' },
            { label: 'Email',      field: 'email',    type: 'email',    placeholder: 'you@example.com' },
            { label: 'Password',   field: 'password', type: 'password', placeholder: 'Min 6 characters' },
          ].map(({ label, field, type, placeholder }) => (
            <div className="form-group" key={field}>
              <label className="form-label">{label}</label>
              <input
                type={type} className="input-field"
                placeholder={placeholder}
                value={form[field]} onChange={set(field)}
                minLength={field === 'password' ? 6 : undefined}
                required
              />
            </div>
          ))}

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={busy}>
            <UserPlus size={18} /> {busy ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-purple)' }}>Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

const centered = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' };
export default Register;
