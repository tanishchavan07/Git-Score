import React from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bookmark, Heart, Trophy } from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab');

  const navItems = [
    { id: 'analyze', label: 'Analyze', icon: Search, path: '/' },
    { id: 'saved', label: 'Saved', icon: Bookmark, path: '/dashboard?tab=saved' },
    { id: 'liked', label: 'Liked', icon: Heart, path: '/dashboard?tab=liked' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, path: '/dashboard?tab=leaderboard' },
  ];

  const isActive = (item) => {
    if (item.id === 'analyze') return location.pathname === '/';
    if (item.id === 'leaderboard') return location.pathname === '/leaderboard';
    if (item.id === 'saved') return location.pathname === '/dashboard' && currentTab === 'saved';
    if (item.id === 'liked') return location.pathname === '/dashboard' && currentTab === 'liked';
    return false;
  };

  return (
    <div className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);
        return (
          <button
            key={item.id}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
