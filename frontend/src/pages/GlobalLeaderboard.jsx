import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, ExternalLink } from 'lucide-react';
import { getGlobalLeaderboard } from '../services/api';
import RoleDropdown from '../components/RoleDropdown';
import './Leaderboard.css';

const GlobalLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [roleFilter, setRoleFilter]   = useState('');
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalCount, setTotalCount]   = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getGlobalLeaderboard(page, 10, roleFilter);
        const raw = res.data.leaderboard ?? [];

        // ─── Deduplicate by username ───
        const seen = new Map();
        raw.forEach((dev) => {
          const key = dev.username?.toLowerCase();
          if (!key) return;
          const existing = seen.get(key);
          if (!existing || (dev.score?.total ?? 0) > (existing.score?.total ?? 0)) {
            seen.set(key, dev);
          }
        });
        const unique = Array.from(seen.values());

        setLeaderboard(unique);
        setTotalPages(res.data.totalPages ?? 1);
        setTotalCount(res.data.totalCount  ?? 0);
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, roleFilter]);

  const handleRoleChange = (role) => {
    setRoleFilter(role);
    setPage(1);
  };

  return (
    <div className="container" style={{ padding: '60px 24px' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lb-header"
      >
        <div className="lb-title-group">
          <h1 className="lb-title">
            <Trophy size={40} color="var(--gold)" /> Global Leaderboard
          </h1>
          <p className="lb-subtitle">
            Discover and connect with top-rated developers globally
            {totalCount > 0 && ` · ${totalCount} developers ranked`}
          </p>
        </div>

        <div className="filters">
          <RoleDropdown 
            value={roleFilter} 
            onChange={handleRoleChange} 
          />
        </div>
      </motion.div>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="glass-card skeleton" style={{ height: 400 }} />
      ) : leaderboard.length === 0 ? (
        <div className="empty-state">
          <Trophy size={48} color="var(--text-secondary)" style={{ marginBottom: 16 }} />
          <h2>No entries found</h2>
          <p>{roleFilter ? `No developers matching "${roleFilter}".` : 'The leaderboard is currently empty.'}</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card table-card"
        >
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Developer</th>
                  <th>Primary Role</th>
                  <th>Score</th>
                  <th>Followers</th>
                  <th>Repos</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((dev) => (
                  <tr
                    key={dev.username}
                    onClick={() => navigate(`/profile/${dev.username}`)}
                    className="lb-row"
                  >
                    <td>
                      <span className={`rank-badge ${
                        dev.rank === 1 ? 'top-rank-1' :
                        dev.rank === 2 ? 'top-rank-2' :
                        dev.rank === 3 ? 'top-rank-3' : ''
                      }`}>
                        {dev.rank}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <img
                          src={dev.avatar}
                          alt={dev.username}
                          style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--card-border)' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{dev.name || dev.username}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            @{dev.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge">{dev.role?.primary || 'Developer'}</span>
                    </td>
                    <td>
                      <span className="score-text">
                        {dev.score?.total ?? 0}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{dev.followers ?? 0}</td>
                    <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{dev.publicRepos ?? 0}</td>
                    <td>
                      <button
                        className="btn-view-sm"
                        onClick={(e) => { e.stopPropagation(); navigate(`/profile/${dev.username}`); }}
                      >
                        <ExternalLink size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn-secondary"
            style={{ borderRadius: 12, padding: '10px 20px' }}
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            {page} / {totalPages}
          </span>
          <button
            className="btn-secondary"
            style={{ borderRadius: 12, padding: '10px 20px' }}
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default GlobalLeaderboard;
