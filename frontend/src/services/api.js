const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '');
const configuredApiUrl = configuredApiBase && !configuredApiBase.startsWith('/')
  ? (/^https?:\/\//i.test(configuredApiBase) ? configuredApiBase : `https://${configuredApiBase}`)
  : '';
const configuredApiOrigin = /^https?:\/\/[a-z0-9-]+$/i.test(configuredApiUrl)
  ? `${configuredApiUrl}.onrender.com`
  : configuredApiUrl;
const API_BASE_URL = configuredApiOrigin
  ? `${configuredApiOrigin.replace(/\/api$/i, '')}/api`
  : '/api';

// Storage keys
const TOKEN_KEY = 'codequest_token';
const USER_KEY = 'codequest_user';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  
  getUser: () => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),
  
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY)
};

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = authStorage.getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      authStorage.clear();
      window.dispatchEvent(new Event('auth-change'));
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data.detail) {
        errorMessage = data.detail;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (data.non_field_errors) {
        errorMessage = data.non_field_errors.join(' ');
      } else if (typeof data === 'object') {
        // Collect first field error
        const firstKey = Object.keys(data)[0];
        if (firstKey) {
          const val = data[firstKey];
          errorMessage = Array.isArray(val) ? `${firstKey}: ${val.join(' ')}` : `${firstKey}: ${val}`;
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export const api = {
  // Auth API
  auth: {
    register: async (credentials) => {
      const data = await request('/auth/register/', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      if (data.token) {
        authStorage.setToken(data.token);
        authStorage.setUser(data.user);
        window.dispatchEvent(new Event('auth-change'));
      }
      return data;
    },

    login: async (credentials) => {
      const data = await request('/auth/login/', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      if (data.token) {
        authStorage.setToken(data.token);
        authStorage.setUser(data.user);
        window.dispatchEvent(new Event('auth-change'));
      }
      return data;
    },

    logout: async () => {
      try {
        await request('/auth/logout/', { method: 'POST' });
      } catch {
        // continue logout even if backend failed
      } finally {
        authStorage.clear();
        window.dispatchEvent(new Event('auth-change'));
      }
    },

    getMe: () => request('/auth/me/'),
    updateProfile: (profileData) => request('/auth/profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
  },

  // Challenges API
  challenges: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      if (params.category && params.category !== 'all') query.append('category', params.category);
      if (params.difficulty && params.difficulty !== 'all') query.append('difficulty', params.difficulty);
      if (params.search) query.append('search', params.search);
      const qStr = query.toString();
      return request(`/challenges/${qStr ? `?${qStr}` : ''}`);
    },

    getById: (idOrSlug) => request(`/challenges/${idOrSlug}/`),

    submit: (idOrSlug, code) => request(`/challenges/${idOrSlug}/submit/`, {
      method: 'POST',
      body: JSON.stringify({ code })
    }),

    getSubmissions: (idOrSlug) => request(`/challenges/${idOrSlug}/submissions/`),

    getExplanation: (idOrSlug) => request(`/challenges/${idOrSlug}/explanation/`)
  },

  // Quizzes API
  quizzes: {
    getCategories: () => request('/quizzes/categories/'),
    getQuestions: (category = 'python', limit = 10) =>
      request(`/quizzes/questions/?category=${encodeURIComponent(category)}&limit=${limit}`),
    submit: (category, answers) => request('/quizzes/submit/', {
      method: 'POST',
      body: JSON.stringify({ category, answers })
    }),
    getAttempts: () => request('/quizzes/attempts/')
  },

  // Dashboard & Progress & Leaderboard
  dashboard: {
    get: () => request('/dashboard/')
  },

  progress: {
    get: () => request('/progress/')
  },

  leaderboard: {
    get: () => request('/leaderboard/')
  },

  achievements: {
    getAll: () => request('/achievements/')
  }
};
