import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-top-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-brand">
              <div className="brand-logo-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
              </div>
              <span className="brand-title">Code<span className="brand-highlight">Quest</span></span>
            </Link>
            <p className="footer-tagline">
              Master algorithm design, database queries, and modern web development through interactive challenges and gamified learning.
            </p>
            <div className="system-status-indicator">
              <span className="status-dot"></span>
              <span className="status-text">All systems operational &bull; DRF API v1.0</span>
            </div>
          </div>

          {/* Practice Tracks */}
          <div className="footer-col">
            <h4 className="footer-heading">Practice Tracks</h4>
            <ul className="footer-links-list">
              <li><Link to="/challenges?category=python">Python Algorithms</Link></li>
              <li><Link to="/challenges?category=javascript">Modern JavaScript</Link></li>
              <li><Link to="/challenges?category=sql">SQL & Databases</Link></li>
              <li><Link to="/challenges?category=html">Semantic HTML</Link></li>
              <li><Link to="/challenges?category=css">CSS & Modern Layouts</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Explore</h4>
            <ul className="footer-links-list">
              <li><Link to="/challenges">All Challenges</Link></li>
              <li><Link to="/quiz">Category Quizzes</Link></li>
              <li><Link to="/leaderboard">Global Leaderboard</Link></li>
              <li><Link to="/dashboard">Personal Dashboard</Link></li>
              <li><Link to="/progress">Skill Analytics</Link></li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="footer-col">
            <h4 className="footer-heading">Architecture</h4>
            <p className="footer-tech-info">
              Engineered with <strong>React</strong>, <strong>Django REST Framework</strong>, and <strong>SQLite</strong>.
            </p>
            <div className="tech-pills">
              <span className="tech-pill">React 19</span>
              <span className="tech-pill">Django 5.2</span>
              <span className="tech-pill">DRF 3.18</span>
              <span className="tech-pill">Pure CSS</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} CodeQuest Interactive Practice Platform. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <span className="footer-muted-item">Clean Code Principles</span>
            <span className="footer-muted-item">Safe Sandbox Evaluation</span>
            <span className="footer-muted-item">Privacy Preserving</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
