import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.leaderboard.get();
      setLeaderboard(data.leaderboard || []);
      setCurrentUserRank(data.current_user_rank);
    } catch (err) {
      setError(err.message || 'Failed to fetch leaderboard standings.');
    } finally {
      setLoading(false);
    }
  };

  const topThree = leaderboard.slice(0, 3);
  const restLeaderboard = leaderboard.slice(3);

  return (
    <div className="leaderboard-page page-container">
      {/* Header */}
      <div className="page-header text-center">
        <span className="section-eyebrow">GLOBAL RANKINGS</span>
        <h1 className="page-title">Hall of Fame</h1>
        <p className="page-subtitle">
          Celebrate the top programmers solving coding quests and scoring high in quizzes.
        </p>
        {currentUserRank && (
          <div className="current-user-rank-banner">
            <span>Your Current Rank: <strong>#{currentUserRank}</strong></span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p className="loading-text">Fetching leaderboard standings...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={loadLeaderboard} className="btn btn-sm btn-outline ml-4">Retry</button>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {topThree.length >= 3 && (
            <div className="podium-container">
              {/* 2nd Place */}
              <div className="podium-item podium-second">
                <div className="podium-medal silver">🥈 2nd</div>
                <div className="podium-avatar">
                  {topThree[1].username.charAt(0).toUpperCase()}
                </div>
                <h3 className="podium-username">{topThree[1].username}</h3>
                <span className="podium-fav">{topThree[1].favorite_language}</span>
                <div className="podium-points">{topThree[1].total_points} XP</div>
                <div className="podium-pedestal p-2"></div>
              </div>

              {/* 1st Place */}
              <div className="podium-item podium-first">
                <div className="podium-crown">👑</div>
                <div className="podium-medal gold">🥇 1st</div>
                <div className="podium-avatar gold-avatar">
                  {topThree[0].username.charAt(0).toUpperCase()}
                </div>
                <h3 className="podium-username">{topThree[0].username}</h3>
                <span className="podium-fav">{topThree[0].favorite_language}</span>
                <div className="podium-points gold-pts">{topThree[0].total_points} XP</div>
                <div className="podium-pedestal p-1"></div>
              </div>

              {/* 3rd Place */}
              <div className="podium-item podium-third">
                <div className="podium-medal bronze">🥉 3rd</div>
                <div className="podium-avatar">
                  {topThree[2].username.charAt(0).toUpperCase()}
                </div>
                <h3 className="podium-username">{topThree[2].username}</h3>
                <span className="podium-fav">{topThree[2].favorite_language}</span>
                <div className="podium-points">{topThree[2].total_points} XP</div>
                <div className="podium-pedestal p-3"></div>
              </div>
            </div>
          )}

          {/* Full Standings Table */}
          <div className="card leaderboard-table-card mt-4">
            <div className="card-header">
              <h2 className="card-title">All Leaderboard Standings</h2>
              <span className="text-muted-sm">{leaderboard.length} Ranked Developers</span>
            </div>

            <div className="table-responsive">
              <table className="custom-table leaderboard-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Rank</th>
                    <th>Developer</th>
                    <th>Specialty</th>
                    <th>Challenges</th>
                    <th>Quizzes</th>
                    <th style={{ textAlign: 'right' }}>Total XP</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((item) => (
                    <tr 
                      key={item.username}
                      className={item.is_current_user ? 'current-user-row' : ''}
                    >
                      <td>
                        <span className={`rank-badge rank-${item.rank}`}>
                          {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`}
                        </span>
                      </td>
                      <td>
                        <div className="table-user-cell">
                          <div className="table-avatar">
                            {item.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="table-username">
                            {item.username}
                            {item.is_current_user && <span className="you-pill">YOU</span>}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="tag-lang">{item.favorite_language || 'Python'}</span>
                      </td>
                      <td>{item.challenges_solved} solved</td>
                      <td>{item.quizzes_completed} tests</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="lb-points">{item.total_points} XP</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
