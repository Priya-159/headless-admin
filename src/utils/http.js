// API Base URL - Update this to your Django backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? '/api'
    : 'http://127.0.0.1:8000/api');

// Development mode - set to True to use mock data when Django is not available
const USE_MOCK_DATA_ON_ERROR = false;

// HTTP utility for making authenticated API requests
class HttpClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.isDjangoAvailable = null; // Track if Django is available
    this.useMockMode = false; // Will be set to true if Django fails
  }

  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem('accessToken');
  }

  // Get refresh token from localStorage
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  // Set auth tokens in localStorage
  setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  // Remove auth tokens from localStorage
  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Refresh access token
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // Refresh token endpoint is now at /auth/token/refresh/ (no /api prefix)
      const rootUrl = this.baseURL.replace(/\/api\/?$/, '');
      const response = await fetch(`${rootUrl}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.setTokens(data.access, data.refresh);
      return data.access;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  // Make API request with automatic token refresh
  async request(endpoint, options = {}) {
    const token = this.getToken();

    // Determine the base URL
    // If endpoint starts with /auth or /notification, use the root URL (remove /api suffix if present)
    let baseUrl = this.baseURL;
    if (endpoint.startsWith('/auth') || endpoint.startsWith('/notification')) {
      baseUrl = this.baseURL.replace(/\/api\/?$/, '');
    }

    // Ensure no double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const url = `${cleanBaseUrl}${cleanEndpoint}`;

    console.log(`📡 Requesting: ${options.method || 'GET'} ${url}`);

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      let response = await fetch(url, config);

      // If unauthorized and we have a refresh token, try to refresh
      if (response.status === 401 && this.getRefreshToken()) {
        try {
          console.log('🔄 Token expired, refreshing...');
          const newToken = await this.refreshAccessToken();
          headers['Authorization'] = `Bearer ${newToken}`;
          config.headers = headers;
          response = await fetch(url, config);
        } catch (refreshError) {
          console.error('❌ Token refresh failed');
          // Refresh failed, redirect to login
          this.clearTokens();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error(`❌ API Error (${response.status}):`, errorMessage);

        if (response.status === 403) {
          console.error('🚫 Permission Denied: You might not be an admin user.');
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Unwrap backend response if it's in { data: ..., msg: ..., error: ... } format
      if (data && typeof data === 'object' && 'data' in data && 'msg' in data) {
        return data.data;
      }

      return data;
    } catch (error) {
      // Check if it's a network error
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        // Only log once, don't spam console
        if (!this.useMockMode) {
          console.log('%c⚠️ Django not available (Network Error), will use mock data', 'color: #FFA500; font-size: 12px;');
          this.useMockMode = true;
        }
        throw new Error('NETWORK_ERROR'); // Special error code
      }
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Upload file
  async upload(endpoint, formData) {
    const token = this.getToken();
    const url = `${this.baseURL}${endpoint}`;

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }
}

// Export singleton instance
const http = new HttpClient();
export default http;