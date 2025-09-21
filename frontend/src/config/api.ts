// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    SIGNUP: `${API_BASE_URL}/auth/signup`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
  },
  INTENTS: `${API_BASE_URL}/intents`,
  PLANS: `${API_BASE_URL}/plans`,
  AI: {
    ENHANCE_SCHEDULE: `${API_BASE_URL}/ai/enhance-schedule`,
    GOAL_RECOMMENDATIONS: `${API_BASE_URL}/ai/goal-recommendations`,
  },
  GOALS: `${API_BASE_URL}/goals`,
  USERS: `${API_BASE_URL}/users`,
};

export default API_BASE_URL;
