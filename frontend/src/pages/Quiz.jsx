import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api, authStorage } from '../services/api';

export default function Quiz() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedCat = searchParams.get('category');
  const navigate = useNavigate();
  const isAuth = authStorage.isAuthenticated();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(requestedCat || null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadQuestions(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const data = await api.quizzes.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadQuestions = async (cat) => {
    setLoading(true);
    setError(null);
    setCurrentIndex(0);
    setUserAnswers({});
    try {
      const data = await api.quizzes.getQuestions(cat, 8);
      if (data.length === 0) {
        setError(`No quiz questions available for ${cat} yet.`);
      } else {
        setQuestions(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load quiz questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionLetter) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionLetter
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!isAuth) {
      alert('Please sign in to submit your quiz and record your score & XP!');
      navigate('/login');
      return;
    }

    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < questions.length) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of ${questions.length} questions. Submit anyway?`
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    try {
      const result = await api.quizzes.submit(selectedCategory, userAnswers);
      navigate('/result', { state: { result } });
    } catch (err) {
      alert(err.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  // If no category selected yet, show Category Selection Screen
  if (!selectedCategory) {
    return (
      <div className="quiz-selection-page page-container">
        <div className="page-header text-center">
          <span className="section-eyebrow">ASSESSMENT ARENA</span>
          <h1 className="page-title">Category Quizzes</h1>
          <p className="page-subtitle">
            Choose a subject to test your conceptual knowledge and earn quest points.
          </p>
        </div>

        <div className="quiz-categories-grid">
          {[
            { key: 'python', name: 'Python Quiz', desc: 'Core syntax, data types, iterators, and lambdas', icon: '🐍', color: '#3b82f6' },
            { key: 'javascript', name: 'JavaScript Quiz', desc: 'ES6+ standards, equality, scope, and array operations', icon: '⚡', color: '#eab308' },
            { key: 'sql', name: 'SQL Querying Quiz', desc: 'Joins, grouping, having clauses, and aggregations', icon: '🗄️', color: '#06b6d4' },
            { key: 'html', name: 'HTML5 Semantics Quiz', desc: 'Accessibility, forms, semantic tags, and document structure', icon: '🌐', color: '#f97316' },
            { key: 'css', name: 'CSS & Layouts Quiz', desc: 'Box model, Flexbox, CSS Grid, and responsive styling', icon: '🎨', color: '#ec4899' },
          ].map((cat) => (
            <div key={cat.key} className="quiz-category-card">
              <div className="quiz-cat-icon-box" style={{ borderColor: cat.color }}>
                <span className="quiz-cat-icon">{cat.icon}</span>
              </div>
              <h3 className="quiz-cat-title">{cat.name}</h3>
              <p className="quiz-cat-desc">{cat.desc}</p>
              <button
                className="btn btn-primary btn-block btn-sm"
                onClick={() => {
                  setSelectedCategory(cat.key);
                  setSearchParams({ category: cat.key });
                }}
              >
                Start Quiz &rarr;
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Active Quiz View
  const currentQuestion = questions[currentIndex];
  const progressPct = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const currentAnswer = currentQuestion ? userAnswers[currentQuestion.id] : null;

  return (
    <div className="quiz-runner-page page-container">
      {/* Quiz Header Bar */}
      <div className="quiz-header-bar card">
        <div className="quiz-header-left">
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => {
              if (window.confirm('Quit quiz and return to category selection?')) {
                setSelectedCategory(null);
                setSearchParams({});
              }
            }}
          >
            &larr; Exit Quiz
          </button>
          <span className="quiz-cat-tag">
            {selectedCategory.toUpperCase()} QUIZ
          </span>
        </div>

        <div className="quiz-header-right">
          <span className="quiz-counter">
            Question <strong>{currentIndex + 1}</strong> of {questions.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="quiz-progress-track">
        <div className="quiz-progress-fill" style={{ width: `${progressPct}%` }}></div>
      </div>

      {loading ? (
        <div className="loading-container card mt-4">
          <div className="spinner-large"></div>
          <p className="loading-text">Loading quiz questions...</p>
        </div>
      ) : error ? (
        <div className="card mt-4">
          <div className="alert alert-error">
            <span>{error}</span>
            <button onClick={() => setSelectedCategory(null)} className="btn btn-sm btn-outline ml-4">Back</button>
          </div>
        </div>
      ) : currentQuestion ? (
        <div className="quiz-question-card card mt-4">
          <div className="question-text-box">
            <h2 className="question-title">{currentQuestion.question_text}</h2>
          </div>

          {/* Options Grid */}
          <div className="options-grid">
            {[
              { letter: 'A', text: currentQuestion.option_a },
              { letter: 'B', text: currentQuestion.option_b },
              { letter: 'C', text: currentQuestion.option_c },
              { letter: 'D', text: currentQuestion.option_d },
            ].map((opt) => {
              const isSelected = currentAnswer === opt.letter;
              return (
                <div
                  key={opt.letter}
                  className={`quiz-option-item ${isSelected ? 'option-selected' : ''}`}
                  onClick={() => handleSelectOption(currentQuestion.id, opt.letter)}
                >
                  <div className="option-letter-badge">{opt.letter}</div>
                  <div className="option-text">{opt.text}</div>
                </div>
              );
            })}
          </div>

          {/* Quiz Navigation Buttons */}
          <div className="quiz-nav-row">
            <button
              className="btn btn-outline btn-md"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              &larr; Previous
            </button>

            <div className="quiz-nav-center">
              <span className="answered-status">
                {userAnswers[currentQuestion.id] ? '✓ Answered' : 'Not answered yet'}
              </span>
            </div>

            {currentIndex < questions.length - 1 ? (
              <button
                className="btn btn-primary btn-md"
                onClick={handleNext}
              >
                Next &rarr;
              </button>
            ) : (
              <button
                className="btn btn-success btn-md"
                onClick={handleSubmitQuiz}
                disabled={submitting}
              >
                {submitting ? 'Submitting Quiz...' : 'Finish & Submit Quiz'}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
