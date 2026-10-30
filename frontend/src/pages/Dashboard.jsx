import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.dashboard.get();
      setDashboardData(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const getRankTitle = (points = 0) => {
    if (points >= 300) return 'Grandmaster Developer';
    if (points >= 200) return 'Senior Algorithm Knight';
    if (points >= 100) return 'Code Adept';
    if (points >= 50) return 'Apprentice Coder';
    return 'Novice Adventurer';
  };

  if (loading) {
    return (
      <div className="page-container loading-container">
        <div className="spinner-large"></div>
        <p className="loading-text">Loading your quest dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container error-container">
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={loadDashboard} className="btn btn-sm btn-outline ml-4">Retry</button>
        </div>
      </div>
    );
  }

  const { user, progress, stats, category_stats, recent_activity, recent_achievements } = dashboardData;

  const categories = [
    { key: 'python', label: 'Python', color: '#3b82f6' },
    { key: 'javascript', label: 'JavaScript', color: '#eab308' },
    { key: 'sql', label: 'SQL', color: '#06b6d4' },
    { key: 'html', label: 'HTML', color: '#f97316' },
    { key: 'css', label: 'CSS', color: '#ec4899' },
  ];

  return (
    <div className="dashboard-page page-container">
      {/* Welcome Banner */}
      <div className="dashboard-welcome-card">
        <div className="welcome-avatar-col">
          <div className="welcome-avatar-ring">
            <span className="welcome-initial">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="welcome-info-col">
          <div className="welcome-eyebrow">
            <span className="user-role-badge">{getRankTitle(progress.total_points)}</span>
            <span className="user-streak-badge">
              🔥 {progress.current_streak} Day Streak
            </span>
          </div>
          <h1 className="welcome-title">
            Welcome back, <span className="text-highlight">{user.username}</span>!
          </h1>
          <p className="welcome-bio">
            {progress.bio || 'Keep solving challenges to climb the global leaderboard and master programming concepts.'}
          </p>
        </div>
        <div className="welcome-actions-col">
          <Link to="/challenges" className="btn btn-primary btn-sm">
            Resume Practice &rarr;
          </Link>
          <Link to="/profile" className="btn btn-outline btn-sm">
            Edit Profile
          </Link>
        </div>
      </div>

      {/* 4 Stats Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Points</span>
            <div className="stat-icon-wrapper points-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
          </div>
          <div className="stat-card-value text-gradient">{stats.total_points} XP</div>
          <div className="stat-card-footer">
            <span>Rank tier: <strong>{getRankTitle(stats.total_points)}</strong></span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Challenges Solved</span>
            <div className="stat-icon-wrapper solved-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{stats.challenges_solved}</div>
          <div className="stat-card-footer">
            <span>Attempted: <strong>{stats.questions_attempted}</strong> problems</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Submission Accuracy</span>
            <div className="stat-icon-wrapper accuracy-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="22" y1="12" x2="18" y2="12"></line>
                <line x1="6" y1="12" x2="2" y2="12"></line>
                <line x1="12" y1="6" x2="12" y2="2"></line>
                <line x1="12" y1="22" x2="12" y2="18"></line>
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{stats.accuracy_percentage}%</div>
          <div className="stat-card-footer">
            <span>Total test submissions: <strong>{stats.total_submissions}</strong></span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Quizzes Completed</span>
            <div className="stat-icon-wrapper quiz-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{stats.quizzes_completed}</div>
          <div className="stat-card-footer">
            <Link to="/quiz" className="stat-card-link">Take another quiz &rarr;</Link>
          </div>
        </div>
      </div>

      {/* Main Dashboard Two-Column Layout */}
      <div className="dashboard-grid-layout">
        {/* Left Column: Category Progress & Quick Launch */}
        <div className="dashboard-col-left">
          <div className="card dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Category Progress</h2>
              <Link to="/progress" className="card-header-link">Detailed Analytics &rarr;</Link>
            </div>
            <div className="category-bars-list">
              {categories.map((cat) => {
                const info = category_stats?.[cat.key] || { solved: 0, total: 1, percentage: 0 };
                return (
                  <div key={cat.key} className="category-bar-item">
                    <div className="bar-labels">
                      <span className="bar-cat-name">{cat.label}</span>
                      <span className="bar-cat-count">
                        {info.solved} / {info.total} Solved ({info.percentage}%)
                      </span>
                    </div>
                    <div className="progress-track">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${Math.min(info.percentage, 100)}%`,
                          backgroundColor: cat.color 
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Launch Action Cards */}
          <div className="quick-actions-row">
            <Link to="/challenges" className="quick-action-card">
              <div className="qa-icon">⚡</div>
              <div className="qa-content">
                <h4>Browse Coding Challenges</h4>
                <p>Filter by language and difficulty level</p>
              </div>
            </Link>
            <Link to="/quiz" className="quick-action-card">
              <div className="qa-icon">🎯</div>
              <div className="qa-content">
                <h4>Take a Category Quiz</h4>
                <p>Instant scoring with explanations</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Recent Activity & Achievements */}
        <div className="dashboard-col-right">
          {/* Recent Activity */}
          <div className="card dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Recent Activity</h2>
              <span className="activity-badge-count">{recent_activity.length} recent</span>
            </div>
            {recent_activity.length === 0 ? (
              <div className="empty-state-mini">
                <p>No activity yet. Solve your first challenge to see history here!</p>
                <Link to="/challenges" className="btn btn-sm btn-primary mt-2">Start Challenge</Link>
              </div>
            ) : (
              <div className="activity-timeline">
                {recent_activity.map((act, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className={`timeline-dot ${act.status === 'passed' ? 'dot-success' : 'dot-info'}`}></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-title">{act.title}</span>
                        {act.points > 0 && (
                          <span className="timeline-xp">+{act.points} XP</span>
                        )}
                      </div>
                      <div className="timeline-meta">
                        <span className="timeline-category">{act.category?.toUpperCase()}</span>
                        <span className="timeline-time">
                          {new Date(act.timestamp).toLocaleDateString()} {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Achievements */}
          {recent_achievements && recent_achievements.length > 0 && (
            <div className="card dashboard-card">
              <div className="card-header">
                <h2 className="card-title">Unlocked Badges</h2>
                <Link to="/progress" className="card-header-link">View All &rarr;</Link>
              </div>
              <div className="badges-mini-grid">
                {recent_achievements.map((ach) => (
                  <div key={ach.code} className="badge-mini-card" style={{ borderColor: ach.badge_color }}>
                    <div className="badge-mini-icon" style={{ backgroundColor: ach.badge_color }}>
                      🏆
                    </div>
                    <div className="badge-mini-details">
                      <h4 className="badge-mini-title">{ach.title}</h4>
                      <p className="badge-mini-desc">{ach.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
