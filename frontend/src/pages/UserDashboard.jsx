import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Bookmark, 
  Heart, 
  Trophy, 
  LayoutDashboard, 
  Search,
  ExternalLink
} from 'lucide-react';
import { getDashboard, getSavedProfiles, getLikedProfiles } from '../services/api';
import ProfileCard from '../components/ProfileCard';
import RoleDropdown from '../components/RoleDropdown';
import './Dashboard.css';
import './Leaderboard.css';

const UserDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'analyzed';

  const [data, setData] = useState({
    analyzed: [],
    saved: [],
    liked: []
  });
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [dashRes, savedRes, likedRes] = await Promise.all([
          getDashboard(),
          getSavedProfiles(),
          getLikedProfiles()
        ]);

        setData({
          analyzed: dashRes.data || [],
          saved: savedRes.data || [],
          liked: likedRes.data || []
        });
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const setTab = (tab) => setSearchParams({ tab });

  // Deduplication helper using username as key
  const deduplicate = (list) => {
    const seen = new Map();
    list.forEach(item => {
      if (!item.username) return;
      seen.set(item.username.toLowerCase(), item);
    });
    return Array.from(seen.values());
  };

  // Memoized unique lists
  const uniqueAnalyzed = useMemo(() => deduplicate(data.analyzed), [data.analyzed]);
  const uniqueSaved = useMemo(() => deduplicate(data.saved), [data.saved]);
  const uniqueLiked = useMemo(() => deduplicate(data.liked), [data.liked]);

  // Section Separation Logic
  const allAnalyzed = uniqueAnalyzed;

  // Personal Leaderboard: Filtered by role, sorted by score with rank
  const leaderboardList = useMemo(() => {
    let filtered = [...uniqueAnalyzed];
    if (roleFilter) {
      filtered = filtered.filter(dev => dev.role?.primary === roleFilter);
    }
    return filtered
      .sort((a, b) => (b.score?.total || 0) - (a.score?.total || 0))
      .map((dev, idx) => ({ ...dev, pRank: idx + 1 }));
  }, [uniqueAnalyzed, roleFilter]);

  const onActionComplete = (type, username, status) => {
    // Refresh to keep UI in sync
    if (type === 'save') {
      const item = data.analyzed.find(d => d.username === username);
      if (status) {
        setData(prev => ({ ...prev, saved: deduplicate([...prev.saved, item].filter(Boolean)) }));
      } else {
        setData(prev => ({ ...prev, saved: prev.saved.filter(d => d.username !== username) }));
      }
    }
    if (type === 'like') {
      const item = data.analyzed.find(d => d.username === username);
      if (status) {
        setData(prev => ({ ...prev, liked: deduplicate([...prev.liked, item].filter(Boolean)) }));
      } else {
        setData(prev => ({ ...prev, liked: prev.liked.filter(d => d.username !== username) }));
      }
    }
  };

  const getRankClass = (rank) => {
    if (rank === 1) return 'top-rank-1';
    if (rank === 2) return 'top-rank-2';
    if (rank === 3) return 'top-rank-3';
    return '';
  };

  const renderContent = () => {
    let currentList = [];
    let emptyMsg = "";
    let Icon = History;
    let isLeaderboard = activeTab === 'leaderboard';

    if (activeTab === 'analyzed') {
      currentList = allAnalyzed;
      emptyMsg = "No profiles analyzed yet.";
      Icon = History;
    } else if (activeTab === 'saved') {
      currentList = uniqueSaved;
      emptyMsg = "No saved profiles yet.";
      Icon = Bookmark;
    } else if (activeTab === 'liked') {
      currentList = uniqueLiked;
      emptyMsg = "No liked profiles yet.";
      Icon = Heart;
    } else if (isLeaderboard) {
      currentList = leaderboardList;
      emptyMsg = "Analyzed profiles ranked by score.";
      Icon = Trophy;
    }

    if (loading) {
      return (
        <div className="dashboard-grid">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="glass-card skeleton" style={{ height: 160 }} />
           ))}
        </div>
      );
    }

    if (currentList.length === 0) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
          <Icon size={48} color="var(--text-secondary)" />
          <h3>{emptyMsg}</h3>
          {roleFilter ? (
             <button className="btn-secondary" onClick={() => setRoleFilter('')} style={{ marginTop: 24 }}>
                Clear Filter
             </button>
          ) : (
            <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: 24 }}>
              <Search size={18} /> Start Analyzing
            </button>
          )}
        </motion.div>
      );
    }

    if (isLeaderboard) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card table-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Developer</th>
                  <th>Primary Role</th>
                  <th>Score</th>
                  <th>Followers</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((dev) => (
                  <tr key={dev.username} onClick={() => navigate(`/profile/${dev.username}`)} className="lb-row">
                    <td>
                      <span className={`rank-badge ${getRankClass(dev.pRank)}`}>
                        {dev.pRank}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={dev.avatar} alt={dev.username} style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--card-border)' }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{dev.name || dev.username}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>@{dev.username}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge">{dev.role?.primary || 'Developer'}</span></td>
                    <td><span className="score-text">{dev.score?.total || 0}</span></td>
                    <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{dev.followers || 0}</td>
                    <td>
                      <button className="btn-view-sm" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${dev.username}`); }}>
                        <ExternalLink size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="dashboard-grid">
        <AnimatePresence mode="popLayout">
          {currentList.map((dev, index) => (
            <motion.div
              key={`${activeTab}-${dev.username}`}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <ProfileCard 
                dev={dev} 
                initialIsSaved={uniqueSaved.some(s => s.username === dev.username)}
                initialIsLiked={uniqueLiked.some(l => l.username === dev.username)}
                onActionComplete={onActionComplete}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="container dashboard-container">
      <header className="lb-header" style={{ marginBottom: 40 }}>
        <div className="lb-title-group">
          <h1 className="lb-title">
            <LayoutDashboard size={40} color="var(--accent-purple)" /> 
            Dashboard
          </h1>
          <p className="lb-subtitle">Manage your analyzed profiles and track rankings</p>
        </div>
        {activeTab === 'leaderboard' && (
           <div className="filters">
              <RoleDropdown value={roleFilter} onChange={setRoleFilter} />
           </div>
        )}
      </header>

      <div className="dashboard-tabs">
        <button 
          className={`tab-item ${activeTab === 'analyzed' ? 'active' : ''}`} 
          onClick={() => setTab('analyzed')}
        >
          <History size={18} /> Analyzed
        </button>
        <button 
          className={`tab-item ${activeTab === 'saved' ? 'active' : ''}`} 
          onClick={() => setTab('saved')}
        >
          <Bookmark size={18} /> Saved
        </button>
        <button 
          className={`tab-item ${activeTab === 'liked' ? 'active' : ''}`} 
          onClick={() => setTab('liked')}
        >
          <Heart size={18} /> Liked
        </button>
        <button 
          className={`tab-item ${activeTab === 'leaderboard' ? 'active' : ''}`} 
          onClick={() => setTab('leaderboard')}
        >
          <Trophy size={18} /> Leaderboard
        </button>
      </div>

      <main className="dashboard-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default UserDashboard;

