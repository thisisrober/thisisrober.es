const API_BASE = '/api';

async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return { data: await res.json(), status: res.status };
  }
  const text = await res.text();
  return { data: { success: false, error: `Error del servidor (${res.status})` }, status: res.status };
}

const api = {
  async get(url, extraHeaders) {
    const options = { credentials: 'include' };
    if (extraHeaders) options.headers = { ...extraHeaders };
    const res = await fetch(`${API_BASE}${url}`, options);
    return parseResponse(res);
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
    return parseResponse(res);
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
    return parseResponse(res);
  },
  async delete(url, extraHeaders) {
    const options = { method: 'DELETE', credentials: 'include' };
    if (extraHeaders) options.headers = { ...extraHeaders };
    const res = await fetch(`${API_BASE}${url}`, options);
    return parseResponse(res);
  },
  async patch(url, body, extraHeaders) {
    const options = {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
      body: JSON.stringify(body),
    };
    const res = await fetch(`${API_BASE}${url}`, options);
    return parseResponse(res);
  },
};

export default api;
