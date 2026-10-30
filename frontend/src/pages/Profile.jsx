import React, { useState, useEffect } from 'react';
import { api, authStorage } from '../services/api';

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    bio: '',
    favorite_language: 'Python',
    email: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.auth.getMe();
      setProfileData(data);
      setFormData({
        bio: data.progress.bio || '',
        favorite_language: data.progress.favorite_language || 'Python',
        email: data.user.email || ''
      });
    } catch (err) {
      setError(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setError(null);

    try {
      const res = await api.auth.updateProfile(formData);
      setProfileData(res);
      setSuccessMessage('Profile information saved successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container loading-container">
        <div className="spinner-large"></div>
        <p className="loading-text">Loading profile...</p>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="page-container error-container">
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={loadProfile} className="btn btn-sm btn-outline ml-4">Retry</button>
        </div>
      </div>
    );
  }

  const { user, progress } = profileData;

  return (
    <div className="profile-page page-container">
      <div className="page-header">
        <span className="section-eyebrow">DEVELOPER ACCOUNT</span>
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">
          Manage your CodeQuest credentials, customize your developer bio, and view your career stats.
        </p>
      </div>

      <div className="profile-grid">
        {/* Left Column: Account Card & Stats */}
        <div className="profile-card card">
          <div className="profile-card-header text-center">
            <div className="profile-avatar-large">
              <span>{user.username.charAt(0).toUpperCase()}</span>
            </div>
            <h2 className="profile-name">{user.username}</h2>
            <span className="profile-lang-badge">
              {progress.favorite_language || 'Python'} Specialist
            </span>
            <p className="profile-joined-date">
              Member since {new Date(user.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="profile-stats-list">
            <div className="p-stat-item">
              <span className="p-stat-label">Total Points</span>
              <span className="p-stat-val text-gradient">{progress.total_points} XP</span>
            </div>
            <div className="p-stat-item">
              <span className="p-stat-label">Challenges Solved</span>
              <span className="p-stat-val">{progress.challenges_solved}</span>
            </div>
            <div className="p-stat-item">
              <span className="p-stat-label">Quizzes Completed</span>
              <span className="p-stat-val">{progress.quizzes_completed}</span>
            </div>
            <div className="p-stat-item">
              <span className="p-stat-label">Streak Status</span>
              <span className="p-stat-val">🔥 {progress.current_streak} Days</span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="profile-form-col card">
          <div className="card-header border-b">
            <h2 className="card-title">Edit Details</h2>
            <span className="text-muted-sm">Visible on leaderboards</span>
          </div>

          <div className="card-body">
            {successMessage && (
              <div className="alert alert-success mb-4">
                <span>✓ {successMessage}</span>
              </div>
            )}
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="profile-form">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  value={user.username}
                  disabled
                  className="form-input input-disabled"
                />
                <span className="field-hint">Usernames are immutable for security.</span>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="name@domain.com"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="favorite_language" className="form-label">Primary Programming Track</label>
                <select
                  id="favorite_language"
                  value={formData.favorite_language}
                  onChange={(e) => setFormData(prev => ({ ...prev, favorite_language: e.target.value }))}
                  className="form-select"
                >
                  <option value="Python">Python</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="SQL">SQL</option>
                  <option value="HTML">HTML</option>
                  <option value="CSS">CSS</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="bio" className="form-label">Developer Bio</label>
                <textarea
                  id="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Share a short summary about your coding journey and goals..."
                  className="form-textarea"
                />
              </div>

              <div className="form-actions-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary btn-md"
                >
                  {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
