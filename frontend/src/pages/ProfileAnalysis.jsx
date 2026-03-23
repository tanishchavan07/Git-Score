import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, Heart, Github, Star, GitFork, AlertCircle, Sparkles, Users, Clock, RefreshCcw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { analyzeGitUser, toggleSave, toggleLike } from '../services/api';
import './ProfileAnalysis.css';

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="container" style={{ paddingTop: 40 }}>
    <div className="glass-card skeleton" style={{ height: 160, marginBottom: 24 }} />
    <div style={{ display: 'flex', gap: 24 }}>
      <div className="glass-card skeleton" style={{ height: 320, flex: '0 0 300px' }} />
      <div className="glass-card skeleton" style={{ height: 320, flex: 1 }} />
    </div>
  </div>
);

// ─── Score bar ────────────────────────────────────────────────────────────────
const ScoreRow = ({ label, value, max }) => (
  <div className="score-row">
    <span>{label}</span>
    <div className="score-bar-outer">
      <div className="score-bar-inner" style={{ width: `${(value / max) * 100}%` }} />
    </div>
    <b>{value}/{max}</b>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const ProfileAnalysis = () => {
  const { username }     = useParams();
  const [searchParams]   = useSearchParams();
  const navigate         = useNavigate();

  const [profile, setProfile]     = useState(null);
  const [ai, setAi]               = useState(null);
  const [loading, setLoading]     = useState(true);
  const [reAnalyzing, setReAnalyzing] = useState(false);
  const [error, setError]         = useState(null);
  const [isSaved, setIsSaved]     = useState(false);
  const [isLiked, setIsLiked]     = useState(false);
  
  const [cached, setCached]       = useState(false);
  const [hoursAgo, setHoursAgo]   = useState(0);

  // ─ Fetch profile from backend ──────────────────────────────────────────────
  const fetchProfile = useCallback(async (force = false) => {
    try {
      if (force) setReAnalyzing(true);
      else setLoading(true);
      
      setError(null);
      const role = searchParams.get('role') || '';
      const res  = await analyzeGitUser(username, role, force);

      setProfile(res.data.saved);
      setAi(res.data.ai);
      setIsSaved(res.data.isSaved ?? false);
      setIsLiked(res.data.isLiked ?? false);
      setCached(res.data.cached ?? false);
      setHoursAgo(res.data.hoursAgo ?? 0);
      
      if (force) toast.success('Profile analysis updated!');
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Login required to analyze profiles.');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to load profile.');
      }
    } finally {
      setLoading(false);
      setReAnalyzing(false);
    }
  }, [username, searchParams, navigate]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // ─ Interactions ────────────────────────────────────────────────────────────
  const handleToggleSave = async () => {
    try {
      const res = await toggleSave(username);
      setIsSaved(res.data.isSaved);
      toast.success(res.data.message);
    } catch {
      toast.error('Login required to save profiles.');
    }
  };

  const handleToggleLike = async () => {
    try {
      const res = await toggleLike(username);
      setIsLiked(res.data.isLiked);
      toast.success(res.data.message);
    } catch {
      toast.error('Login required to like profiles.');
    }
  };

  // ─ Render states ───────────────────────────────────────────────────────────
  if (loading) return <Skeleton />;

  if (error) return (
    <div className="container" style={{ textAlign: 'center', marginTop: 100 }}>
      <AlertCircle size={48} color="#ef4444" />
      <h2 style={{ marginTop: 16 }}>{error}</h2>
      <button className="btn-primary" style={{ marginTop: 24 }} onClick={() => navigate('/')}>
        Try another username
      </button>
    </div>
  );

  if (!profile) return null;

  const score = profile.score || {};

  return (
    <div className="container analysis-container">

      {/* ── Staleness Banner ─────────────────────────────────────────────── */}
      {cached && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="staleness-banner">
          <div className="staleness-info">
            <Clock size={16} />
            <span>
              Showing data from {hoursAgo === 0 ? 'less than an hour ago' : `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`}
            </span>
          </div>
          <button 
            className="btn-reanalyze" 
            onClick={() => fetchProfile(true)}
            disabled={reAnalyzing}
          >
            {reAnalyzing ? (
              <Loader2 size={14} className="spin" />
            ) : (
              <RefreshCcw size={14} />
            )}
            {reAnalyzing ? 'Analyzing...' : 'Re-analyze'}
          </button>
        </motion.div>
      )}

      {/* ── Profile Header ───────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card profile-header">
        <div className="profile-info-main">
          <img src={profile.avatar} alt="Avatar" className="profile-avatar" />
          <div className="profile-text">
            <h2>
              {profile.name}
              <span className="text-muted"> (@{profile.username})</span>
            </h2>
            <p className="bio">{profile.bio || 'No bio available.'}</p>
            <div className="badges-row">
              <span className="badge">{profile.role?.primary || ai?.role || 'Developer'}</span>
              {profile.role?.source && (
                <span className="badge" style={{ background: profile.role.source === 'user' ? 'rgba(29,158,117,0.2)' : 'rgba(127,119,221,0.2)', color: profile.role.source === 'user' ? 'var(--accent-teal)' : 'var(--accent-purple)' }}>
                  {profile.role.source === 'user' ? '✎ User-set' : '✦ AI-detected'}
                </span>
              )}
              {profile.level && (
                <span className="badge" style={{ background: 'rgba(127,119,221,0.15)', color: 'var(--accent-purple)' }}>
                  {profile.level}
                </span>
              )}
            </div>

            <div className="stat-pills">
              <span><Users size={14} /> {profile.followers} followers</span>
              <span><Github size={14} /> {profile.publicRepos} repos</span>
              {profile.location && <span>📍 {profile.location}</span>}
            </div>
          </div>
        </div>

        <div className="interaction-buttons">
          <button className={`icon-btn ${isLiked ? 'active-like' : ''}`} onClick={handleToggleLike} title="Like">
            <Heart fill={isLiked ? 'currentColor' : 'none'} size={22} />
          </button>
          <button className={`icon-btn ${isSaved ? 'active-save' : ''}`} onClick={handleToggleSave} title="Save">
            <Bookmark fill={isSaved ? 'currentColor' : 'none'} size={22} />
          </button>
          <a href={profile.profileUrl} target="_blank" rel="noreferrer" className="icon-btn" title="Open GitHub">
            <Github size={22} />
          </a>
        </div>
      </motion.div>

      {/* ── Main Grid ────────────────────────────────────────────────────── */}
      <div className="analysis-grid">

        {/* Left column */}
        <div className="grid-left">

          {/* Score card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card score-card">
            <h3>Total Score</h3>
            <div className="big-score">
              <span className="score-num">{score.total ?? 0}</span>
              <span className="score-max"> / 100</span>
            </div>
            <div className="score-breakdown">
              <ScoreRow label="Repos"       value={score.reposScore       ?? 0} max={20} />
              <ScoreRow label="Stars"       value={score.starsScore       ?? 0} max={20} />
              <ScoreRow label="Activity"    value={score.activityScore    ?? 0} max={20} />
              <ScoreRow label="Consistency" value={score.consistencyScore ?? 0} max={20} />
              <ScoreRow label="Profile"     value={score.profileScore     ?? 0} max={20} />
            </div>
          </motion.div>

          {/* Raw stats */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card stats-card">
            <h3>Raw Stats</h3>
            <div className="stats-grid">
              <div className="stat-box"><Github size={20} /><b>{profile.publicRepos}</b><span>Repos</span></div>
              <div className="stat-box"><Star    size={20} /><b>{profile.totalStars}</b><span>Stars</span></div>
              <div className="stat-box"><GitFork size={20} /><b>{profile.totalForks}</b><span>Forks</span></div>
            </div>
          </motion.div>

        </div>

        {/* Right column */}
        <div className="grid-right">

          {/* AI Insights */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card ai-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-purple)' }}>
              <Sparkles size={20} /> AI Insights
            </h3>
            {ai?.summary && <p className="ai-summary">{ai.summary}</p>}
            <div className="ai-lists">
              <div className="ai-box positive">
                <h4>Strengths</h4>
                <ul>
                  {(ai?.strengths?.length ? ai.strengths : profile.insights)?.map((s, i) => <li key={i}>{s}</li>) ?? <li>None identified.</li>}
                </ul>
              </div>
              <div className="ai-box warning">
                <h4>Improvements</h4>
                <ul>
                  {(ai?.improvements?.length ? ai.improvements : profile.improvements)?.map((s, i) => <li key={i}>{s}</li>) ?? <li>None identified.</li>}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Languages */}
          {profile.languages?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card lang-card">
              <h3>Top Languages</h3>
              <div className="lang-bar-container">
                {profile.languages.slice(0, 6).map((lang, i) => (
                  <div key={i} className="lang-row">
                    <div className="lang-name">{lang.name}</div>
                    <div className="lang-bar-outer">
                      <div className="lang-bar-inner bg-gradient" style={{ width: `${lang.percentage}%` }} />
                    </div>
                    <div className="lang-pct">{lang.percentage}%</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProfileAnalysis;
