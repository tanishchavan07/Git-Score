import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Github, User as UserIcon, Award, Activity, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path ? 'nav-item active' : 'nav-item';

  // Generate avatar initials from email or name
  const getInitials = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <nav className="navbar glass-card">
      <div className="container nav-content">
        <Link to="/" className="brand">
          <Github className="brand-icon" />
          <span className="brand-text">Git<span className="accent">Score</span></span>
        </Link>
        
        <div className="nav-links">
          <Link to="/" className={isActive('/')}>
            <Activity size={18} /> Analyze
          </Link>
          <Link to="/leaderboard" className={isActive('/leaderboard')}>
            <Award size={18} /> Leaderboard
          </Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')}>
                <LayoutDashboard size={18} /> Dashboard
              </Link>

              {/* User Avatar + Dropdown */}
              <div className="user-menu" ref={dropdownRef}>
                <button
                  className="user-avatar-btn"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-label="User menu"
                  aria-expanded={dropdownOpen}
                >
                  <div className="avatar-circle">
                    {getInitials()}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`chevron ${dropdownOpen ? 'chevron-up' : ''}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">{getInitials()}</div>
                      <div className="dropdown-user-info">
                        {user.name && <div className="dropdown-name">{user.name}</div>}
                        <div className="dropdown-email">{user.email}</div>
                      </div>
                    </div>

                    <div className="dropdown-divider" />

                    <Link to="/edit-profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <UserIcon size={16} />
                      Edit Profile
                    </Link>

                    <div className="dropdown-divider" />

                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
