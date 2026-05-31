// frontend/services/api.js
const API_URL = 'http://192.168.56.1:3005/api';

class ApiService {
  async request(method, url, body = null) {
    try {
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        // IMPORTANT: Inclure les cookies
        credentials: 'include',
      };

      if (body) {
        config.body = JSON.stringify(body);
      }

      console.log(`[API] ${method} ${API_URL}${url}`);
      const response = await fetch(`${API_URL}${url}`, config);
      const data = await response.json();
      
      console.log(`[API] Status: ${response.status}`);
      return { data, status: response.status };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  get(url) {
    return this.request('GET', url);
  }

  post(url, body) {
    return this.request('POST', url, body);
  }

  put(url, body) {
    return this.request('PUT', url, body);
  }

  delete(url) {
    return this.request('DELETE', url);
  }
}

export default new ApiService();