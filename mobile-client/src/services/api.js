const API_URL = 'http://192.168.56.1:3000/api';

const api = {
  get: async (url) => {
    const response = await fetch(`${API_URL}${url}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const data = await response.json();
    return { data };
  },
  
  post: async (url, body) => {
    const response = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return { data };
  },
  
  put: async (url, body) => {
    const response = await fetch(`${API_URL}${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return { data };
  },
  
  delete: async (url) => {
    const response = await fetch(`${API_URL}${url}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const data = await response.json();
    return { data };
  },
};

export default api;