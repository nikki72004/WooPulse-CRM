const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include',
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  demoLogin: () => apiRequest('/auth/demo-login', { method: 'POST' }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getMe: () => apiRequest('/auth/me'),

  // Dashboard & Search
  getDashboard: () => apiRequest('/dashboard'),
  search: (q) => apiRequest(`/search?q=${encodeURIComponent(q)}`),

  // Customers
  getCustomers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/customers${query ? `?${query}` : ''}`);
  },
  getCustomerById: (id) => apiRequest(`/customers/${id}`),
  updateCustomer: (id, updates) => apiRequest(`/customers/${id}`, { method: 'PATCH', body: updates }),
  getDuplicates: () => apiRequest('/customers/duplicates'),
  resolveDuplicate: (id, action) => apiRequest(`/customers/duplicates/${id}/resolve`, { method: 'POST', body: { action } }),

  // Orders
  getOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/orders${query ? `?${query}` : ''}`);
  },
  getOrderById: (id) => apiRequest(`/orders/${id}`),

  // Notes & Tasks
  addNote: (customerId, body) => apiRequest('/notes', { method: 'POST', body: { customerId, body } }),
  deleteNote: (id) => apiRequest(`/notes/${id}`, { method: 'DELETE' }),
  getTasks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/tasks${query ? `?${query}` : ''}`);
  },
  createTask: (data) => apiRequest('/tasks', { method: 'POST', body: data }),
  updateTask: (id, updates) => apiRequest(`/tasks/${id}`, { method: 'PATCH', body: updates }),
  deleteTask: (id) => apiRequest(`/tasks/${id}`, { method: 'DELETE' }),

  // Communications
  getCommHistory: () => apiRequest('/communications/history'),
  getTemplates: () => apiRequest('/communications/templates'),
  previewEmail: (data) => apiRequest('/communications/preview', { method: 'POST', body: data }),
  sendEmail: (data) => apiRequest('/communications/send', { method: 'POST', body: data }),

  // Sync & Webhooks
  getSyncStatus: () => apiRequest('/sync/status'),
  getSyncHistory: () => apiRequest('/sync/history'),
  runSync: (type = 'incremental') => apiRequest('/sync/run', { method: 'POST', body: { type } }),
  getWebhookEvents: () => apiRequest('/webhooks/events'),
  simulateWebhook: (type) => apiRequest('/webhooks/simulate', { method: 'POST', body: { type } }),

  // Agent Action Console
  getAgentRecommendations: (customerId = null) => {
    const query = customerId ? `?customerId=${encodeURIComponent(customerId)}` : '';
    return apiRequest(`/agent/recommendations${query}`);
  },
  executeAgentAction: (actionType, payload) => apiRequest('/agent/actions/execute', { method: 'POST', body: { actionType, payload } }),

  // Insights & Settings
  getInsights: () => apiRequest('/insights/summary'),
  getSettings: () => apiRequest('/settings/status'),
  sendTestEmail: (email) => apiRequest('/settings/test-email', { method: 'POST', body: { email } }),
};
