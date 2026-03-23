import axios from 'axios';

// ─── Centralized Axios Instance ──────────────────────────────────────────────
const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,   // send JWT cookie with every request
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const loginUser     = (email, password)              => api.post('/auth/login',    { email, password });
export const registerUser  = (name, phone, email, password) => api.post('/auth/register', { name, phone, email, password });
export const logoutUser    = ()                             => api.post('/user/logout');

// ─── User Profile ─────────────────────────────────────────────────────────────
export const editProfile    = (data) => api.put('/user/edit-profile',    data);
export const changePassword = (data) => api.put('/user/change-password', data);
export const getDashboard   = ()     => api.get('/user/dashboard');
export const getSavedProfiles = ()   => api.get('/user/saved');
export const getLikedProfiles = ()   => api.get('/user/liked');

// ─── GitHub Analysis ──────────────────────────────────────────────────────────
// Backend: GET /git/search/:username?role=xxx
export const analyzeGitUser = (username, role, force = false) => {
  const params = {};
  if (role) params.role = role;
  if (force) params.force = true;
  return api.get(`/git/search/${encodeURIComponent(username)}`, { params });
};

// ─── Save & Like ──────────────────────────────────────────────────────────────
export const toggleSave = (username) => api.post(`/git/save/${encodeURIComponent(username)}`);
export const toggleLike = (username) => api.post(`/git/like/${encodeURIComponent(username)}`);

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export const getGlobalLeaderboard = (page = 1, limit = 10, role = '') => {
  const params = { page, limit };
  if (role) params.role = role;
  return api.get('/leaderboard/global', { params });
};

export const getUserLeaderboard = (page = 1, limit = 10, role = '') => {
  const params = { page, limit };
  if (role) params.role = role;
  return api.get('/leaderboard/user', { params });
};

export default api;
