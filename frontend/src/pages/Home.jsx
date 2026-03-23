import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import RoleDropdown from '../components/RoleDropdown';
import './Home.css';

const ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'DevOps Engineer',
];

const Home = () => {
  const [username, setUsername] = useState('');
  const [role, setRole]         = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;

    // Strip full GitHub URLs down to the username only
    const parsed = trimmed.replace(/^https?:\/\/github\.com\//i, '').split('/')[0];

    const qs = role ? `?role=${encodeURIComponent(role)}` : '';
    navigate(`/analyze/${encodeURIComponent(parsed)}${qs}`);
  };

  return (
    <div className="home-container container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="hero-section"
      >
        <span className="badge hero-badge">
          <Sparkles size={14} /> AI-Powered GitHub Analytics
        </span>

        <h1 className="hero-title">
          Discover True <span className="gradient-text">Developer Talent</span>
        </h1>

        <p className="hero-subtitle">
          Analyze GitHub profiles in seconds — score 0–100, AI insights, language breakdown,
          consistency tracking and engineering roles.
        </p>

        <form onSubmit={handleSearch} className="search-form glass-card">
          <div className="search-inputs">

            <div className="input-with-icon">
              <Search className="input-icon" size={20} />
              <input
                type="text"
                placeholder="GitHub username or full URL  (e.g. torvalds)"
                className="input-field hero-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="role-selector-custom" style={{ minWidth: 200 }}>
              <RoleDropdown 
                value={role} 
                onChange={setRole} 
                options={ROLES}
                defaultLabel="Auto-Detect Role (AI)"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary analyze-btn" disabled={!username.trim()}>
            Analyze Profile
          </button>
        </form>

        <p className="home-hint">
          No signup needed to preview &nbsp;·&nbsp; Login to save & track history
        </p>
      </motion.div>
    </div>
  );
};

export default Home;
