import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, authStorage } from '../services/api';

export default function Home() {
  const isAuth = authStorage.isAuthenticated();
  const [stats, setStats] = useState({
    challengesCount: 13,
    quizzesCount: 16,
    activeLearners: 5,
    languages: 5
  });

  useEffect(() => {
    // Optionally fetch dynamic numbers from public endpoints
    api.challenges.getAll().then(res => {
      if (Array.isArray(res)) {
        setStats(prev => ({ ...prev, challengesCount: res.length }));
      }
    }).catch(() => {});
  }, []);

  const tracks = [
    { name: 'Python', icon: '🐍', count: 'Algorithms & Data Structures', color: '#3b82f6', category: 'python' },
    { name: 'JavaScript', icon: '⚡', count: 'Modern ES6+ & Functional', color: '#eab308', category: 'javascript' },
    { name: 'SQL', icon: '🗄️', count: 'Queries, Aggregates & Joins', color: '#06b6d4', category: 'sql' },
    { name: 'HTML5', icon: '🌐', count: 'Accessible Semantics & Forms', color: '#f97316', category: 'html' },
    { name: 'CSS3', icon: '🎨', count: 'Flexbox, Grid & Micro-UI', color: '#ec4899', category: 'css' },
  ];

  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      ),
      title: 'Real-Time Evaluation',
      desc: 'Submit your solution and receive instant automated test case verification with detailed feedback and performance metrics.'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      ),
      title: 'Interactive Quizzes',
      desc: 'Sharpen your conceptual understanding with targeted multiple-choice quizzes designed to test key concepts and syntax nuances.'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      ),
      title: 'Skill Progress Tracking',
      desc: 'Visualize your growth across all 5 programming tracks, inspect accuracy history, and identify areas to sharpen.'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
          <path d="M4 22h16"></path>
          <path d="M10 14.66V17c0 .55-.45 1-1 1H7"></path>
          <path d="M14 14.66V17c0 .55.45 1 1 1h2"></path>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>
        </svg>
      ),
      title: 'Gamified Leaderboard',
      desc: 'Compete globally, earn quest points, rise through the tiers, and unlock coveted achievement badges for your trophy case.'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow-blob hero-glow-1"></div>
        <div className="hero-glow-blob hero-glow-2"></div>

        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-sparkle">✦</span>
              <span>Next-Gen Practice for Modern Developers</span>
            </div>

            <h1 className="hero-title">
              Level Up Your <span className="text-gradient">Coding Skills</span>
            </h1>

            <p className="hero-subtitle">
              CodeQuest empowers programmers of all levels to master algorithms, SQL queries, frontend styling, and modern web development through interactive challenges and instant evaluation.
            </p>

            <div className="hero-cta-group">
              <Link to="/challenges" className="btn btn-primary btn-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>Start Coding</span>
              </Link>
              <Link to="/quiz" className="btn btn-outline btn-lg">
                <span>Explore Quizzes</span>
              </Link>
              {isAuth && (
                <Link to="/dashboard" className="btn btn-ghost btn-lg">
                  <span>Open Dashboard &rarr;</span>
                </Link>
              )}
            </div>

            {/* Quick stats ribbon */}
            <div className="hero-stats-ribbon">
              <div className="hero-stat-item">
                <span className="stat-number">{stats.languages}</span>
                <span className="stat-label">Tracks</span>
              </div>
              <div className="stat-separator">/</div>
              <div className="hero-stat-item">
                <span className="stat-number">{stats.challengesCount}+</span>
                <span className="stat-label">Challenges</span>
              </div>
              <div className="stat-separator">/</div>
              <div className="hero-stat-item">
                <span className="stat-number">{stats.quizzesCount}+</span>
                <span className="stat-label">Quiz Items</span>
              </div>
              <div className="stat-separator">/</div>
              <div className="hero-stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Safe Sandbox</span>
              </div>
            </div>
          </div>

          {/* Interactive Code Preview Card */}
          <div className="hero-visual">
            <div className="code-mockup-card">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
                <div className="mockup-title">two_sum.py — Python 3.11</div>
                <div className="mockup-badge">Live Evaluator</div>
              </div>
              <div className="mockup-body">
                <pre className="mockup-code">
                  <code>
{`def two_sum(nums, target):
    """
    Find indices of two numbers that sum to target
    Time Complexity: O(n) | Space: O(n)
    """
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`}
                  </code>
                </pre>
              </div>
              <div className="mockup-footer">
                <div className="mockup-eval-status">
                  <span className="status-indicator-dot success"></span>
                  <span>All 3 Test Cases Passed (+30 XP)</span>
                </div>
                <span className="mockup-runtime">Runtime: 12ms</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Language Tracks Section */}
      <section className="tracks-section">
        <div className="section-header text-center">
          <span className="section-eyebrow">PRACTICE PATHS</span>
          <h2 className="section-title">Master 5 Core Disciplines</h2>
          <p className="section-description">
            Choose your focus area and progress from beginner syntax to advanced algorithmic mastery.
          </p>
        </div>

        <div className="tracks-grid">
          {tracks.map((track) => (
            <Link 
              to={`/challenges?category=${track.category}`} 
              key={track.name} 
              className="track-card"
            >
              <div className="track-icon-wrapper" style={{ borderColor: track.color }}>
                <span className="track-icon">{track.icon}</span>
              </div>
              <div className="track-details">
                <h3 className="track-title">{track.name}</h3>
                <p className="track-subtitle">{track.count}</p>
              </div>
              <div className="track-arrow">&rarr;</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="section-header text-center">
          <span className="section-eyebrow">WHY CODEQUEST</span>
          <h2 className="section-title">Engineered for Rapid Skill Progression</h2>
          <p className="section-description">
            Everything you need to practice consistently, test your code securely, and benchmark your progress.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feat, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-icon-box">{feat.icon}</div>
              <h3 className="feature-title">{feat.title}</h3>
              <p className="feature-text">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action banner */}
      <section className="cta-banner-section">
        <div className="cta-banner-card">
          <div className="cta-content">
            <h2 className="cta-heading">Ready to Prove Your Skills?</h2>
            <p className="cta-sub">
              Join CodeQuest today to test your knowledge against real challenges, gain points, and climb the leaderboard.
            </p>
            <div className="cta-button-row">
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Free Account
              </Link>
              <Link to="/challenges" className="btn btn-outline btn-lg">
                Browse Challenges First
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
