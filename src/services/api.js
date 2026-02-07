const API_BASE = '/api';

const api = {
  async get(url) {
    const res = await fetch(`${API_BASE}${url}`, { credentials: 'include' });
    return { data: await res.json(), status: res.status };
  },
  async post(url, body, isFormData = false) {
    const options = {
      method: 'POST',
      credentials: 'include',
    };
    if (isFormData) {
      options.body = body;
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(body);
    }
    const res = await fetch(`${API_BASE}${url}`, options);
    return { data: await res.json(), status: res.status };
  },
  async put(url, body, isFormData = false) {
    const options = {
      method: 'PUT',
      credentials: 'include',
    };
    if (isFormData) {
      options.body = body;
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(body);
    }
    const res = await fetch(`${API_BASE}${url}`, options);
    return { data: await res.json(), status: res.status };
  },
  async delete(url) {
    const res = await fetch(`${API_BASE}${url}`, { method: 'DELETE', credentials: 'include' });
    return { data: await res.json(), status: res.status };
  },
};

export default api;
