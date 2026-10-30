import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { authStorage, api } from '../services/api';

export default function Navbar() {
  const [user, setUser] = useState(authStorage.getUser());
  const [isAuth, setIsAuth] = useState(authStorage.isAuthenticated());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuth(authStorage.isAuthenticated());
      setUser(authStorage.getUser());
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.auth.logout();
      setMobileMenuOpen(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  const navLinkClass = ({ isActive }) =>
    isActive ? 'nav-link active' : 'nav-link';

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-logo-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </div>
          <span className="brand-title">Code<span className="brand-highlight">Quest</span></span>
          <span className="brand-badge">PRO</span>
        </Link>

        {/* Mobile menu toggle */}
        <button 
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>

        {/* Desktop Navigation Links */}
        <nav className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink to="/" className={navLinkClass} end onClick={() => setMobileMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/challenges" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
            Challenges
          </NavLink>
          <NavLink to="/quiz" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
            Quizzes
          </NavLink>
          <NavLink to="/leaderboard" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
            Leaderboard
          </NavLink>

          {isAuth && (
            <>
              <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </NavLink>
              <NavLink to="/progress" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
                Progress
              </NavLink>
            </>
          )}

          {/* Auth Actions in Menu */}
          <div className="navbar-auth-actions">
            {isAuth ? (
              <div className="user-menu-container">
                <Link 
                  to="/profile" 
                  className="user-profile-chip"
                  onClick={() => setMobileMenuOpen(false)}
                  title="View Profile"
                >
                  <span className="user-avatar-initial">
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span className="user-chip-name">{user?.username || 'Profile'}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm logout-btn"
                  disabled={loggingOut}
                >
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            ) : (
              <div className="auth-buttons-group">
                <Link 
                  to="/login" 
                  className="btn btn-ghost btn-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-primary btn-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
