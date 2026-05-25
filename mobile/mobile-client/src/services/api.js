// Version avec fetch uniquement (sans axios)
const API_URL = 'http://192.168.56.1:3000/api';

const api = {
  get: async (url) => {
    try {
      const response = await fetch(`${API_URL}${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      console.error('GET Error:', error);
      throw error;
    }
  },
  
  post: async (url, body) => {
    try {
      const response = await fetch(`${API_URL}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      console.error('POST Error:', error);
      throw error;
    }
  },
  
  put: async (url, body) => {
    try {
      const response = await fetch(`${API_URL}${url}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      console.error('PUT Error:', error);
      throw error;
    }
  },
  
  delete: async (url) => {
    try {
      const response = await fetch(`${API_URL}${url}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      console.error('DELETE Error:', error);
      throw error;
    }
  },
};

export default api;