import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import ChallengeCard from '../components/ChallengeCard';

export default function Challenges() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Keep search params synced
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && cat !== categoryFilter) {
      setCategoryFilter(cat);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchChallenges();
  }, [categoryFilter, difficultyFilter, searchQuery]);

  const fetchChallenges = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.challenges.getAll({
        category: categoryFilter,
        difficulty: difficultyFilter,
        search: searchQuery
      });
      setChallenges(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch challenges.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (cat) => {
    setCategoryFilter(cat);
    if (cat === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: cat });
    }
  };

  const categories = [
    { key: 'all', label: 'All Tracks' },
    { key: 'python', label: 'Python' },
    { key: 'javascript', label: 'JavaScript' },
    { key: 'sql', label: 'SQL' },
    { key: 'html', label: 'HTML' },
    { key: 'css', label: 'CSS' },
  ];

  const difficulties = [
    { key: 'all', label: 'All Difficulties' },
    { key: 'beginner', label: 'Beginner' },
    { key: 'intermediate', label: 'Intermediate' },
    { key: 'advanced', label: 'Advanced' },
  ];

  return (
    <div className="challenges-page page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <span className="section-eyebrow">PRACTICE ARENA</span>
          <h1 className="page-title">Coding Challenges</h1>
          <p className="page-subtitle">
            Hone your programming prowess with interactive problem-solving across Python, SQL, JavaScript, HTML, and CSS.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filters-container card">
        <div className="search-bar-wrapper">
          <div className="search-input-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search challenges by title or problem keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>&times;</button>
            )}
          </div>
        </div>

        <div className="filters-row">
          {/* Category Tabs */}
          <div className="category-pills-group">
            {categories.map((cat) => (
              <button
                key={cat.key}
                className={`filter-pill ${categoryFilter === cat.key ? 'pill-active' : ''}`}
                onClick={() => handleCategoryChange(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Difficulty Dropdown */}
          <div className="difficulty-select-wrapper">
            <label htmlFor="difficulty-select" className="filter-label">Difficulty:</label>
            <select
              id="difficulty-select"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="form-select"
            >
              {difficulties.map((d) => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Challenges List State */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p className="loading-text">Loading challenges...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={fetchChallenges} className="btn btn-sm btn-outline ml-4">Retry</button>
        </div>
      ) : challenges.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">🔍</div>
          <h3>No challenges found</h3>
          <p>Try adjusting your category, difficulty, or search term to discover available quests.</p>
          <button 
            onClick={() => { setCategoryFilter('all'); setDifficultyFilter('all'); setSearchQuery(''); }}
            className="btn btn-primary btn-sm mt-3"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="challenges-grid">
          {challenges.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>
      )}
    </div>
  );
}
