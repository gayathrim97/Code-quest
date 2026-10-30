import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field-specific error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.username.trim()) errs.username = 'Username is required.';
    if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (formData.password !== formData.confirm_password) {
      errs.confirm_password = 'Passwords do not match.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await api.auth.register(formData);
      navigate('/dashboard');
    } catch (err) {
      if (err.data && typeof err.data === 'object') {
        setErrors(err.data);
      } else {
        setErrors({ general: err.message || 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-brand-logo">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join CodeQuest and start leveling up your coding skills today</p>
          </div>

          {errors.general && (
            <div className="alert alert-error">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g. dev_knight"
                className={`form-input ${errors.username ? 'input-error' : ''}`}
                required
              />
              {errors.username && <span className="field-error-msg">{Array.isArray(errors.username) ? errors.username.join(' ') : errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address <span className="optional-tag">(Optional)</span></label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@domain.com"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
              />
              {errors.email && <span className="field-error-msg">{Array.isArray(errors.email) ? errors.email.join(' ') : errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                required
              />
              {errors.password && <span className="field-error-msg">{Array.isArray(errors.password) ? errors.password.join(' ') : errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirm_password" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Repeat password"
                className={`form-input ${errors.confirm_password ? 'input-error' : ''}`}
                required
              />
              {errors.confirm_password && <span className="field-error-msg">{Array.isArray(errors.confirm_password) ? errors.confirm_password.join(' ') : errors.confirm_password}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? (
                <span className="btn-loading-state">
                  <span className="spinner"></span> Creating Account...
                </span>
              ) : (
                'Create CodeQuest Account'
              )}
            </button>
          </form>

          <div className="auth-footer-prompt">
            Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
