import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from '../utils/keychainHelper';
import { BASE_URL } from '../utils/GlobalText';
import { store } from '../store/store'; // Import store to dispatch actions

class ApiService {
  constructor() {
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  // Queue mein pending requests ko process karo
  processQueue(error, token = null) {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  // 🔥 NEW: Handle session expiry - clear tokens and logout
  async handleSessionExpiry() {
    console.log('🔴 Session expired, logging out...');
    try {
      await clearTokens();
      // Dispatch logout action to update Redux state
      store.dispatch({ type: 'LOGOUT' });
      // You can also dispatch a logout action if needed
      // store.dispatch(logout());
    } catch (error) {
      console.error('❌ Error during session expiry handling:', error);
    }
  }

  // Token refresh karne wala function
  async refreshToken() {
    try {
      console.log('🔄 Refreshing token...');
      
      const refreshToken = await getRefreshToken();
      
      if (!refreshToken) {
        console.log('❌ No refresh token available');
        await this.handleSessionExpiry();
        throw new Error('No refresh token available');
      }

      console.log('🌐 Calling refresh token API...');
      const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      console.log('📡 Refresh token response:', data);

      if (!response.ok) {
        // 🔥 If refresh token API fails, clear tokens and logout
        await this.handleSessionExpiry();
        throw new Error(data.message || 'Token refresh failed');
      }

      // Extract new tokens
      const { access, refresh } = data.data.tokens;
      const user = data.data.user;

      // Save new tokens
      await saveTokens(access.token, refresh.token, user);
      
      console.log('✅ Token refresh successful');
      
      return {
        accessToken: access.token,
        refreshToken: refresh.token,
        user: user
      };
      
    } catch (error) {
      console.error('❌ Refresh token error:', error);
      // 🔥 Ensure tokens are cleared on any error
      await this.handleSessionExpiry();
      throw error;
    }
  }

  // Main request function with retry logic
  async request(endpoint, options = {}, retryCount = 0) {
    try {
      const accessToken = await getAccessToken();
      
      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Agar response 401 hai to token refresh try karo
      if (response.status === 401) {
        console.log('🔴 401 Unauthorized, attempting token refresh...');
        
        // Agar already refresh chal raha hai to queue mein daalo
        if (this.isRefreshing) {
          console.log('⏳ Token refresh in progress, queueing request...');
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(async (newToken) => {
            // Queue se naye token ke saath request retry karo
            const newOptions = {
              ...options,
              headers: {
                ...options.headers,
                'Authorization': `Bearer ${newToken}`,
              },
            };
            return this.request(endpoint, newOptions, retryCount + 1);
          });
        }

        this.isRefreshing = true;

        try {
          // Token refresh karo
          const { accessToken: newToken } = await this.refreshToken();
          
          // Queue mein pending requests ko process karo
          this.processQueue(null, newToken);
          
          // Original request ko retry karo naye token ke saath
          const newOptions = {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${newToken}`,
            },
          };
          
          const retryResponse = await fetch(`${BASE_URL}${endpoint}`, newOptions);
          
          this.isRefreshing = false;
          return retryResponse;
          
        } catch (refreshError) {
          // Refresh fail ho gaya to saari pending requests reject karo
          this.processQueue(refreshError, null);
          this.isRefreshing = false;
          
          // 🔥 Session expired - clear tokens and logout
          await this.handleSessionExpiry();
          throw new Error('Session expired. Please login again.');
        }
      }

      // Agar 401 nahi hai to normal response return karo
      return response;
      
    } catch (error) {
      console.error(`❌ API request error for ${endpoint}:`, error);
      
      // 🔥 Agar error "Session expired" hai to handle karo
      if (error.message === 'Session expired. Please login again.') {
        await this.handleSessionExpiry();
      }
      
      throw error;
    }
  }

  // Helper methods for different HTTP verbs
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // For multipart/form-data (file uploads)
  async upload(endpoint, formData, options = {}) {
    try {
      const accessToken = await getAccessToken();
      
      const headers = {
        'Content-Type': 'multipart/form-data',
        ...(options.headers || {}),
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      console.log(`📤 Upload request to ${endpoint}`);
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        method: 'POST',
        headers,
        body: formData,
      });

      // Handle 401 for uploads
      if (response.status === 401) {
        console.log('🔴 401 on upload, attempting token refresh...');
        
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(async (newToken) => {
            const newOptions = {
              ...options,
              headers: {
                ...options.headers,
                'Authorization': `Bearer ${newToken}`,
              },
            };
            return fetch(`${BASE_URL}${endpoint}`, {
              ...newOptions,
              method: 'POST',
              body: formData,
            });
          });
        }

        this.isRefreshing = true;

        try {
          const { accessToken: newToken } = await this.refreshToken();
          this.processQueue(null, newToken);
          
          const newOptions = {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${newToken}`,
            },
          };
          
          const retryResponse = await fetch(`${BASE_URL}${endpoint}`, {
            ...newOptions,
            method: 'POST',
            body: formData,
          });
          
          this.isRefreshing = false;
          return retryResponse;
          
        } catch (refreshError) {
          this.processQueue(refreshError, null);
          this.isRefreshing = false;
          
          // 🔥 Session expired - clear tokens and logout
          await this.handleSessionExpiry();
          throw new Error('Session expired. Please login again.');
        }
      }

      return response;
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      
      // 🔥 Agar error "Session expired" hai to handle karo
      if (error.message === 'Session expired. Please login again.') {
        await this.handleSessionExpiry();
      }
      
      throw error;
    }
  }
}

// Singleton instance export karo
const apiService = new ApiService();
export default apiService;