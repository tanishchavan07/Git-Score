import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Bookmark, ExternalLink } from 'lucide-react';
import { toggleLike, toggleSave } from '../services/api';
import toast from 'react-hot-toast';

const ProfileCard = ({ dev, initialIsSaved = false, initialIsLiked = false, onActionComplete }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [loading, setLoading] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      setLoading(true);
      const res = await toggleLike(dev.username);
      setIsLiked(res.data.isLiked);
      toast.success(res.data.isLiked ? 'Liked profile' : 'Unliked profile');
      if (onActionComplete) onActionComplete('like', dev.username, res.data.isLiked);
    } catch (err) {
      toast.error('Failed to update like status');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      setLoading(true);
      const res = await toggleSave(dev.username);
      setIsSaved(res.data.isSaved);
      toast.success(res.data.isSaved ? 'Saved profile' : 'Removed from saved');
      if (onActionComplete) onActionComplete('save', dev.username, res.data.isSaved);
    } catch (err) {
      toast.error('Failed to update save status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card compact-card" onClick={() => navigate(`/profile/${dev.username}`)}>
      <div className="card-top">
        <img 
          src={dev.avatar} 
          alt={dev.username} 
          className="compact-avatar" 
          onError={(e) => e.target.src = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}
        />
        <div className="card-identity">
          <h3 className="card-name-title">{dev.name || dev.username}</h3>
          <div className="card-handle-sub">@{dev.username}</div>
          <span className="badge-mini">
            {dev.role?.primary || 'Developer'}
          </span>
        </div>
      </div>

      <div className="compact-stats">
        <div className="compact-stat-item">
          <span className="compact-val">{dev.score?.total || 0}</span>
          <span className="compact-lbl">Score</span>
        </div>
        <div className="compact-stat-item">
          <span className="compact-val">{dev.followers || 0}</span>
          <span className="compact-lbl">Followers</span>
        </div>
      </div>

      <div className="compact-actions">
        <button 
          className="btn-view-modern" 
          onClick={() => navigate(`/profile/${dev.username}`)}
        >
          <ExternalLink size={14} /> Details
        </button>
        
        <div className="compact-toggles">
          <button 
            className={`toggle-icon ${isLiked ? 'is-liked' : ''}`} 
            onClick={handleLike}
            disabled={loading}
          >
            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          <button 
            className={`toggle-icon ${isSaved ? 'is-saved' : ''}`} 
            onClick={handleSave}
            disabled={loading}
          >
            <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
