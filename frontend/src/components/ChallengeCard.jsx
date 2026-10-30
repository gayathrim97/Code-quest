import React from 'react';
import { Link } from 'react-router-dom';

export default function ChallengeCard({ challenge }) {
  const getCategoryClass = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'python': return 'badge-python';
      case 'sql': return 'badge-sql';
      case 'html': return 'badge-html';
      case 'css': return 'badge-css';
      case 'javascript': return 'badge-javascript';
      default: return 'badge-default';
    }
  };

  const getDifficultyClass = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'beginner': return 'badge-beginner';
      case 'intermediate': return 'badge-intermediate';
      case 'advanced': return 'badge-advanced';
      default: return 'badge-default';
    }
  };

  return (
    <div className={`challenge-card ${challenge.is_solved ? 'card-solved' : ''}`}>
      <div className="challenge-card-header">
        <div className="badges-group">
          <span className={`badge ${getCategoryClass(challenge.category)}`}>
            {challenge.category?.toUpperCase()}
          </span>
          <span className={`badge ${getDifficultyClass(challenge.difficulty)}`}>
            {challenge.difficulty?.charAt(0).toUpperCase() + challenge.difficulty?.slice(1)}
          </span>
        </div>
        <div className="challenge-points-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span>{challenge.points} XP</span>
        </div>
      </div>

      <h3 className="challenge-card-title">{challenge.title}</h3>
      
      <div className="challenge-card-footer">
        {challenge.is_solved ? (
          <div className="solved-status-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Solved</span>
          </div>
        ) : (
          <span className="unsolved-status-text">Unsolved</span>
        )}

        <Link 
          to={`/challenges/${challenge.slug || challenge.id}`} 
          className={`btn btn-sm ${challenge.is_solved ? 'btn-outline' : 'btn-primary'}`}
        >
          {challenge.is_solved ? 'Review Code' : 'Solve Quest'} &rarr;
        </Link>
      </div>
    </div>
  );
}
