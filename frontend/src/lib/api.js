const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || data.message || 'Request failed');
    error.status = response.status;
    error.details = data.details;
    throw error;
  }

  return data;
}

export const authApi = {
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => apiRequest('/auth/me'),
  deleteAccount: () => apiRequest('/auth/me', { method: 'DELETE' })
};

export const siteApi = {
  list: () => apiRequest('/sites'),
  get: (id) => apiRequest(`/sites/${id}`),
  create: (payload) => apiRequest('/sites', { method: 'POST', body: JSON.stringify(payload) }),
  updateDraft: (id, payload) => apiRequest(`/sites/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  publish: (id) => apiRequest(`/sites/${id}/publish`, { method: 'POST' }),
  unpublish: (id) => apiRequest(`/sites/${id}/unpublish`, { method: 'POST' }),
  delete: (id) => apiRequest(`/sites/${id}`, { method: 'DELETE' }),
  getPublic: (username) => apiRequest(`/public/${username}`)
};

export const generateApi = {
  fromPrompt: (prompt) => apiRequest('/generate/prompt', { method: 'POST', body: JSON.stringify({ prompt }) }),
  extractProfile: (formData) => apiRequest('/generate/extract', { method: 'POST', body: formData }),
  fromProfile: (payload) => apiRequest('/generate/from-profile', { method: 'POST', body: JSON.stringify(payload) }),
  refine: (payload) => apiRequest('/generate/refine', { method: 'POST', body: JSON.stringify(payload) })
};
