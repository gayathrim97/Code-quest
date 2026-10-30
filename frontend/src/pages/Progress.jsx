import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyTab, setHistoryTab] = useState('challenges');

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.progress.get();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load progress details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container loading-container">
        <div className="spinner-large"></div>
        <p className="loading-text">Calculating skill analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container error-container">
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={loadProgress} className="btn btn-sm btn-outline ml-4">Retry</button>
        </div>
      </div>
    );
  }

  const { progress, categories, recent_submissions, recent_quizzes, achievements } = data;

  return (
    <div className="progress-page page-container">
      {/* Header */}
      <div className="page-header">
        <span className="section-eyebrow">ANALYTICS & MASTERY</span>
        <h1 className="page-title">Skill Progress & History</h1>
        <p className="page-subtitle">
          Track your learning milestones, category proficiencies, and review past submissions and attempts.
        </p>
      </div>

      {/* Summary Stats Overview */}
      <div className="stats-grid mb-5">
        <div className="stat-card">
          <span className="stat-card-title">Quest Points</span>
          <div className="stat-card-value text-gradient">{progress.total_points} XP</div>
          <div className="stat-card-footer">Total accumulated points</div>
        </div>
        <div className="stat-card">
          <span className="stat-card-title">Challenges Solved</span>
          <div className="stat-card-value">{progress.challenges_solved}</div>
          <div className="stat-card-footer">Coding tasks successfully verified</div>
        </div>
        <div className="stat-card">
          <span className="stat-card-title">Quizzes Completed</span>
          <div className="stat-card-value">{progress.quizzes_completed}</div>
          <div className="stat-card-footer">Knowledge tests attempted</div>
        </div>
        <div className="stat-card">
          <span className="stat-card-title">Active Streak</span>
          <div className="stat-card-value">🔥 {progress.current_streak} Days</div>
          <div className="stat-card-footer">Consistent daily learning</div>
        </div>
      </div>

      {/* Category Mastery Progress Section with Custom SVG Radial Rings */}
      <div className="card mb-5">
        <div className="card-header">
          <h2 className="card-title">Category Mastery Breakdown</h2>
          <span className="text-muted-sm">Percentage of challenges solved in each track</span>
        </div>

        <div className="category-rings-grid">
          {categories.map((cat) => {
            const radius = 38;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (cat.pct / 100) * circumference;

            return (
              <div key={cat.key} className="category-ring-card">
                <div className="svg-ring-wrapper">
                  <svg width="100" height="100" viewBox="0 0 100 100" className="radial-progress-svg">
                    <circle
                      className="radial-bg"
                      cx="50"
                      cy="50"
                      r={radius}
                      strokeWidth="8"
                    />
                    <circle
                      className="radial-fill"
                      cx="50"
                      cy="50"
                      r={radius}
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                    />
                  </svg>
                  <div className="radial-center-text">
                    <span className="pct-num">{cat.pct}%</span>
                  </div>
                </div>
                <h4 className="ring-cat-title">{cat.category}</h4>
                <p className="ring-cat-sub">{cat.solved} of {cat.total} completed</p>
                <Link to={`/challenges?category=${cat.key}`} className="ring-action-link">
                  Practice &rarr;
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements Trophy Case */}
      <div className="card mb-5">
        <div className="card-header">
          <h2 className="card-title">Achievements Trophy Case</h2>
          <span className="text-muted-sm">
            {achievements.filter(a => a.is_unlocked).length} of {achievements.length} Unlocked
          </span>
        </div>

        <div className="achievements-gallery-grid">
          {achievements.map((ach) => (
            <div 
              key={ach.code} 
              className={`achievement-card ${ach.is_unlocked ? 'ach-unlocked' : 'ach-locked'}`}
              style={{ borderColor: ach.is_unlocked ? ach.badge_color : 'var(--border-color)' }}
            >
              <div 
                className="ach-icon-circle"
                style={{ 
                  backgroundColor: ach.is_unlocked ? ach.badge_color : 'rgba(255,255,255,0.05)',
                  color: ach.is_unlocked ? '#fff' : '#64748b'
                }}
              >
                {ach.is_unlocked ? '🏆' : '🔒'}
              </div>
              <div className="ach-card-info">
                <h4 className="ach-title">{ach.title}</h4>
                <p className="ach-desc">{ach.description}</p>
                <div className="ach-meta">
                  <span className="ach-reward-xp">+{ach.points_reward} XP</span>
                  {ach.is_unlocked ? (
                    <span className="ach-status-badge unlocked">Unlocked</span>
                  ) : (
                    <span className="ach-status-badge locked">Locked</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History Tabs Section: Challenges vs Quizzes */}
      <div className="card">
        <div className="card-header border-b">
          <div className="history-tabs-nav">
            <button
              className={`history-tab-btn ${historyTab === 'challenges' ? 'active' : ''}`}
              onClick={() => setHistoryTab('challenges')}
            >
              Challenges Submission History ({recent_submissions.length})
            </button>
            <button
              className={`history-tab-btn ${historyTab === 'quizzes' ? 'active' : ''}`}
              onClick={() => setHistoryTab('quizzes')}
            >
              Quiz Attempts History ({recent_quizzes.length})
            </button>
          </div>
        </div>

        <div className="card-body">
          {historyTab === 'challenges' ? (
            recent_submissions.length === 0 ? (
              <div className="empty-state-mini">
                <p>No challenge submissions recorded yet.</p>
                <Link to="/challenges" className="btn btn-sm btn-primary mt-2">Solve a Challenge</Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Challenge Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Points</th>
                      <th>Submitted At</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent_submissions.map((sub) => (
                      <tr key={sub.id}>
                        <td><strong>{sub.question_title}</strong></td>
                        <td>
                          <span className={`badge badge-${sub.question_category?.toLowerCase()}`}>
                            {sub.question_category?.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill status-${sub.status}`}>
                            {sub.status === 'passed' ? '✓ Passed' : '✗ Failed'}
                          </span>
                        </td>
                        <td>+{sub.points_awarded} XP</td>
                        <td>{new Date(sub.submitted_at).toLocaleDateString()} {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>
                          <Link to={`/challenges/${sub.question}`} className="btn btn-ghost btn-xs">
                            View Quest
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            recent_quizzes.length === 0 ? (
              <div className="empty-state-mini">
                <p>No quiz attempts recorded yet.</p>
                <Link to="/quiz" className="btn btn-sm btn-primary mt-2">Take a Quiz</Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Points</th>
                      <th>Completed At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent_quizzes.map((q) => (
                      <tr key={q.id}>
                        <td><strong>{q.category?.toUpperCase()} QUIZ</strong></td>
                        <td>{q.correct_answers} / {q.total_questions}</td>
                        <td>
                          <span className={`score-badge ${q.score_percentage >= 70 ? 'score-high' : 'score-low'}`}>
                            {q.score_percentage}%
                          </span>
                        </td>
                        <td>+{q.points_awarded} XP</td>
                        <td>{new Date(q.completed_at).toLocaleDateString()} {new Date(q.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
