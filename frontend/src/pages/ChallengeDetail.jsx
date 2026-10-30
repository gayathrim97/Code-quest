import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, authStorage } from '../services/api';

export default function ChallengeDetail() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const isAuth = authStorage.isAuthenticated();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editor state
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Tabs: 'description' | 'history' | 'solution'
  const [activeTab, setActiveTab] = useState('description');
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [explanationData, setExplanationData] = useState(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  useEffect(() => {
    loadChallenge();
  }, [idOrSlug]);

  const loadChallenge = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.challenges.getById(idOrSlug);
      setChallenge(data);
      setCode(data.starter_code || '');
    } catch (err) {
      setError(err.message || 'Failed to load challenge.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (tab === 'history' && isAuth && submissions.length === 0) {
      loadSubmissions();
    }
    if (tab === 'solution' && isAuth && !explanationData) {
      loadExplanation();
    }
  };

  const loadSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const subs = await api.challenges.getSubmissions(idOrSlug);
      setSubmissions(subs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const loadExplanation = async () => {
    setLoadingExplanation(true);
    try {
      const expl = await api.challenges.getExplanation(idOrSlug);
      setExplanationData(expl);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleResetCode = () => {
    if (window.confirm('Reset code editor to starter template?')) {
      setCode(challenge?.starter_code || '');
      setSubmissionResult(null);
    }
  };

  const handleKeyDown = (e) => {
    // Handle tab key indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const spaces = '    ';
      const newCode = code.substring(0, start) + spaces + code.substring(end);
      setCode(newCode);
      // set cursor position after render
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleSubmit = async () => {
    if (!isAuth) {
      alert('Please log in or register to submit your solution and earn XP!');
      navigate('/login');
      return;
    }

    if (!code.trim()) {
      alert('Please write some code before submitting.');
      return;
    }

    setSubmitting(true);
    setSubmissionResult(null);

    try {
      const result = await api.challenges.submit(idOrSlug, code);
      setSubmissionResult(result);
      if (result.passed) {
        setChallenge(prev => ({ ...prev, is_solved: true }));
      }
      // Refresh submissions if user was on history tab
      if (activeTab === 'history') {
        loadSubmissions();
      }
    } catch (err) {
      setSubmissionResult({
        passed: false,
        status: 'error',
        message: err.message || 'Evaluation error occurred.',
        test_results: [{ name: 'Submission Error', passed: false, message: err.message }]
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container loading-container">
        <div className="spinner-large"></div>
        <p className="loading-text">Loading challenge environment...</p>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="page-container error-container">
        <div className="alert alert-error">
          <span>{error || 'Challenge not found.'}</span>
          <Link to="/challenges" className="btn btn-sm btn-outline ml-4">Back to Challenges</Link>
        </div>
      </div>
    );
  }

  // Calculate line numbers
  const lineCount = Math.max(code.split('\n').length, 12);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="challenge-detail-page">
      {/* Top Banner Navigation */}
      <div className="challenge-top-nav">
        <div className="nav-left-group">
          <Link to="/challenges" className="back-link">
            &larr; All Challenges
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="current-challenge-title">{challenge.title}</span>
        </div>
        <div className="nav-right-group">
          <span className={`badge badge-${challenge.category}`}>
            {challenge.category.toUpperCase()}
          </span>
          <span className={`badge badge-${challenge.difficulty}`}>
            {challenge.difficulty.toUpperCase()}
          </span>
          <span className="points-pill-gold">
            +{challenge.points} XP
          </span>
        </div>
      </div>

      {/* Two Column Split Screen Layout */}
      <div className="challenge-split-layout">
        {/* Left Column: Problem Information & Tabs */}
        <div className="challenge-info-panel">
          <div className="panel-tabs-header">
            <button
              className={`panel-tab-btn ${activeTab === 'description' ? 'tab-active' : ''}`}
              onClick={() => handleTabChange('description')}
            >
              Description
            </button>
            <button
              className={`panel-tab-btn ${activeTab === 'history' ? 'tab-active' : ''}`}
              onClick={() => handleTabChange('history')}
            >
              Submissions {submissions.length > 0 && `(${submissions.length})`}
            </button>
            <button
              className={`panel-tab-btn ${activeTab === 'solution' ? 'tab-active' : ''}`}
              onClick={() => handleTabChange('solution')}
            >
              Solution & Explanation
            </button>
          </div>

          <div className="panel-content-body">
            {activeTab === 'description' && (
              <div className="problem-description-content">
                <div className="problem-title-row">
                  <h1 className="problem-title">{challenge.title}</h1>
                  {challenge.is_solved && (
                    <span className="badge badge-success solved-pill">
                      ✓ Solved
                    </span>
                  )}
                </div>

                <div className="problem-statement-text">
                  {challenge.description.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                {challenge.constraints && (
                  <div className="problem-sub-section">
                    <h3 className="section-subtitle">Constraints</h3>
                    <div className="code-inline-block">
                      {challenge.constraints}
                    </div>
                  </div>
                )}

                {/* Sample Input / Output */}
                {(challenge.sample_input || challenge.sample_output) && (
                  <div className="sample-io-container">
                    {challenge.sample_input && (
                      <div className="sample-io-box">
                        <div className="sample-io-label">Sample Input</div>
                        <pre className="sample-io-code">{challenge.sample_input}</pre>
                      </div>
                    )}
                    {challenge.sample_output && (
                      <div className="sample-io-box">
                        <div className="sample-io-label">Expected Output</div>
                        <pre className="sample-io-code">{challenge.sample_output}</pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Public Test Cases Preview */}
                {challenge.public_test_cases && challenge.public_test_cases.length > 0 && (
                  <div className="problem-sub-section">
                    <h3 className="section-subtitle">Visible Test Cases</h3>
                    <div className="public-test-cases-list">
                      {challenge.public_test_cases.map((tc, idx) => (
                        <div key={idx} className="test-case-preview-card">
                          <div className="tc-preview-name">{tc.description}</div>
                          {tc.input && (
                            <div className="tc-preview-row">
                              <span className="tc-lbl">Input:</span>
                              <code>{tc.input}</code>
                            </div>
                          )}
                          <div className="tc-preview-row">
                            <span className="tc-lbl">Expected:</span>
                            <code>{tc.expected_output}</code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="submissions-history-content">
                <h3 className="section-subtitle">Your Past Submissions</h3>
                {!isAuth ? (
                  <p className="login-prompt">
                    Please <Link to="/login" className="auth-link">sign in</Link> to view your submission history.
                  </p>
                ) : loadingSubmissions ? (
                  <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading your submission history...</p>
                  </div>
                ) : submissions.length === 0 ? (
                  <p className="empty-history-text">You haven't submitted any code for this quest yet.</p>
                ) : (
                  <div className="submissions-table-wrapper">
                    <table className="submissions-table">
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Points</th>
                          <th>Submitted</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((sub) => (
                          <tr key={sub.id}>
                            <td>
                              <span className={`status-pill status-${sub.status}`}>
                                {sub.status === 'passed' ? '✓ Passed' : '✗ Failed'}
                              </span>
                            </td>
                            <td>+{sub.points_awarded} XP</td>
                            <td>{new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</td>
                            <td>
                              <button 
                                className="btn btn-ghost btn-xs"
                                onClick={() => {
                                  setCode(sub.code);
                                  alert('Loaded this submission into the code editor.');
                                }}
                              >
                                Load Code
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'solution' && (
              <div className="solution-explanation-content">
                <h3 className="section-subtitle">Reference Solution & Walkthrough</h3>
                {!isAuth ? (
                  <p className="login-prompt">
                    Please <Link to="/login" className="auth-link">sign in</Link> to view the reference solution and breakdown.
                  </p>
                ) : loadingExplanation ? (
                  <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading solution walkthrough...</p>
                  </div>
                ) : explanationData ? (
                  <div>
                    <div className="explanation-text-block">
                      <p>{explanationData.explanation}</p>
                    </div>

                    <h4 className="mt-4 mb-2 font-semibold">Reference Solution:</h4>
                    <pre className="solution-code-block">
                      <code>{explanationData.solution_code}</code>
                    </pre>

                    <button 
                      className="btn btn-outline btn-sm mt-3"
                      onClick={() => {
                        setCode(explanationData.solution_code);
                        alert('Copied reference solution into editor!');
                      }}
                    >
                      Copy to Editor
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor & Test Results Console */}
        <div className="challenge-editor-panel">
          {/* Editor Header Bar */}
          <div className="editor-header-bar">
            <div className="editor-file-title">
              <span className="file-icon">📄</span>
              <span>solution.{challenge.category === 'python' ? 'py' : challenge.category === 'sql' ? 'sql' : challenge.category === 'html' ? 'html' : challenge.category === 'css' ? 'css' : 'js'}</span>
            </div>
            <div className="editor-controls">
              <button 
                type="button" 
                className="btn btn-ghost btn-xs"
                onClick={handleResetCode}
                title="Reset to starter code"
              >
                Reset Code
              </button>
            </div>
          </div>

          {/* Monospace Code Editor Area */}
          <div className="code-editor-viewport">
            <div className="line-numbers-col" aria-hidden="true">
              {lineNumbers.map((num) => (
                <div key={num} className="line-number">{num}</div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              className="code-textarea"
              spellCheck="false"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              placeholder="// Write your solution here..."
            />
          </div>

          {/* Action Row */}
          <div className="editor-action-bar">
            <div className="action-meta">
              <span className="meta-text">Press <strong>Submit Solution</strong> to test against test cases</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-primary btn-md submit-code-btn"
            >
              {submitting ? (
                <>
                  <span className="spinner"></span>
                  <span>Evaluating Code...</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  <span>Submit Solution</span>
                </>
              )}
            </button>
          </div>

          {/* Test Case Evaluation Results Console */}
          {submissionResult && (
            <div className="test-results-console">
              <div className={`results-banner ${submissionResult.passed ? 'banner-success' : 'banner-failed'}`}>
                <div className="banner-left">
                  <span className="banner-icon">
                    {submissionResult.passed ? '✓' : '✗'}
                  </span>
                  <span className="banner-text">
                    {submissionResult.message}
                  </span>
                </div>
                {submissionResult.points_awarded > 0 && (
                  <span className="banner-xp-badge">
                    +{submissionResult.points_awarded} XP Earned!
                  </span>
                )}
              </div>

              {/* Achievement celebration alert */}
              {submissionResult.new_achievements && submissionResult.new_achievements.length > 0 && (
                <div className="achievement-unlocked-banner">
                  <span className="ach-banner-icon">🏆</span>
                  <div className="ach-banner-text">
                    <strong>Achievement Unlocked: {submissionResult.new_achievements[0].title}!</strong>
                    <p>{submissionResult.new_achievements[0].description} (+{submissionResult.new_achievements[0].points_reward} Bonus XP)</p>
                  </div>
                </div>
              )}

              {/* Individual test case results */}
              <div className="test-cases-feedback-list">
                <h4 className="feedback-heading">Test Results:</h4>
                {submissionResult.test_results?.map((tr, idx) => (
                  <div 
                    key={idx} 
                    className={`test-case-item ${tr.passed ? 'tc-passed' : 'tc-failed'}`}
                  >
                    <div className="tc-status-indicator">
                      {tr.passed ? '✓' : '✗'}
                    </div>
                    <div className="tc-info">
                      <div className="tc-name-row">
                        <strong>{tr.name}</strong>
                        <span className={`tc-status-label ${tr.passed ? 'txt-success' : 'txt-error'}`}>
                          {tr.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                      {tr.message && <div className="tc-message">{tr.message}</div>}
                      {tr.expected && (
                        <div className="tc-diff-row">
                          <span className="tc-diff-tag">Expected:</span>
                          <code>{tr.expected}</code>
                        </div>
                      )}
                      {tr.actual && !tr.passed && (
                        <div className="tc-diff-row">
                          <span className="tc-diff-tag">Actual:</span>
                          <code>{tr.actual}</code>
                        </div>
                      )}
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
