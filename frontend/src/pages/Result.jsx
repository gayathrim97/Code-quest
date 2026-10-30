import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return (
      <div className="page-container empty-state card">
        <div className="empty-state-icon">📋</div>
        <h2>No Quiz Result Found</h2>
        <p>Please complete a quiz first to view your score breakdown.</p>
        <Link to="/quiz" className="btn btn-primary btn-sm mt-3">Go to Quizzes</Link>
      </div>
    );
  }

  const {
    category,
    total_questions,
    correct_answers,
    score_percentage,
    points_awarded,
    answers_summary,
    new_achievements
  } = result;

  const isSuccess = score_percentage >= 70;

  return (
    <div className="quiz-result-page page-container">
      {/* Result Summary Card */}
      <div className="result-score-card card text-center">
        <div className="result-score-badge">
          <span className="score-number">{score_percentage}%</span>
          <span className="score-sub">Accuracy</span>
        </div>

        <h1 className="result-headline">
          {score_percentage === 100
            ? '🏆 Outstanding! Perfect Score!'
            : score_percentage >= 75
            ? '🎉 Great Job! Solid Mastery!'
            : '💪 Good Effort! Keep Practicing!'}
        </h1>

        <p className="result-summary-text">
          You answered <strong>{correct_answers}</strong> out of <strong>{total_questions}</strong> questions correctly in the <strong>{category?.toUpperCase()}</strong> quiz.
        </p>

        <div className="result-xp-reward">
          <span className="xp-icon">⚡</span>
          <span>+{points_awarded} XP Earned</span>
        </div>

        {/* New achievements unlocked celebration */}
        {new_achievements && new_achievements.length > 0 && (
          <div className="achievement-unlocked-banner mt-4">
            <span className="ach-banner-icon">🎖️</span>
            <div className="ach-banner-text">
              <strong>Achievement Unlocked: {new_achievements[0].title}!</strong>
              <p>{new_achievements[0].description} (+{new_achievements[0].points_reward} Bonus XP)</p>
            </div>
          </div>
        )}

        <div className="result-actions-row">
          <Link to={`/quiz?category=${category}`} className="btn btn-primary btn-md">
            Retake Quiz
          </Link>
          <Link to="/quiz" className="btn btn-outline btn-md">
            Try Another Category
          </Link>
          <Link to="/dashboard" className="btn btn-ghost btn-md">
            Go to Dashboard &rarr;
          </Link>
        </div>
      </div>

      {/* Question Breakdown and Explanations */}
      <div className="answers-breakdown-section mt-5">
        <h2 className="section-title mb-4">Detailed Question Review & Explanations</h2>

        <div className="breakdown-list">
          {answers_summary?.map((item, idx) => (
            <div 
              key={idx} 
              className={`breakdown-card card ${item.is_correct ? 'bd-correct' : 'bd-incorrect'}`}
            >
              <div className="bd-card-header">
                <span className="bd-q-number">Question {idx + 1}</span>
                <span className={`bd-status-pill ${item.is_correct ? 'status-correct' : 'status-incorrect'}`}>
                  {item.is_correct ? '✓ Correct' : '✗ Incorrect'}
                </span>
              </div>

              <h3 className="bd-question-text">{item.question_text}</h3>

              <div className="bd-answers-compare">
                <div className="compare-item">
                  <span className="compare-lbl">Your Choice:</span>
                  <span className={`compare-val ${item.is_correct ? 'val-correct' : 'val-wrong'}`}>
                    Option {item.selected || 'None'}
                  </span>
                </div>
                {!item.is_correct && (
                  <div className="compare-item">
                    <span className="compare-lbl">Correct Choice:</span>
                    <span className="compare-val val-correct">
                      Option {item.correct}
                    </span>
                  </div>
                )}
              </div>

              {item.explanation && (
                <div className="bd-explanation-box">
                  <span className="expl-tag">Explanation:</span>
                  <p className="expl-text">{item.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
