const API_BASE = '/api';

const api = {
  async get(url, extraHeaders) {
    const options = { credentials: 'include' };
    if (extraHeaders) options.headers = { ...extraHeaders };
    const res = await fetch(`${API_BASE}${url}`, options);
    return { data: await res.json(), status: res.status };
  },
  async post(url, body, isFormData = false, extraHeaders) {
    const options = {
      method: 'POST',
      credentials: 'include',
    };
    if (isFormData) {
      options.body = body;
      if (extraHeaders) options.headers = { ...extraHeaders };
    } else {
      options.headers = { 'Content-Type': 'application/json', ...extraHeaders };
      options.body = JSON.stringify(body);
    }
    const res = await fetch(`${API_BASE}${url}`, options);
    return { data: await res.json(), status: res.status };
  },
  async put(url, body, isFormData = false, extraHeaders) {
    const options = {
      method: 'PUT',
      credentials: 'include',
    };
    if (isFormData) {
      options.body = body;
      if (extraHeaders) options.headers = { ...extraHeaders };
    } else {
      options.headers = { 'Content-Type': 'application/json', ...extraHeaders };
      options.body = JSON.stringify(body);
    }
    const res = await fetch(`${API_BASE}${url}`, options);
    return { data: await res.json(), status: res.status };
  },
  async delete(url, extraHeaders) {
    const options = { method: 'DELETE', credentials: 'include' };
    if (extraHeaders) options.headers = { ...extraHeaders };
    const res = await fetch(`${API_BASE}${url}`, options);
    return { data: await res.json(), status: res.status };
  },
  async patch(url, body, extraHeaders) {
    const options = {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
      body: JSON.stringify(body),
    };
    const res = await fetch(`${API_BASE}${url}`, options);
    return { data: await res.json(), status: res.status };
  },
};

export default api;
