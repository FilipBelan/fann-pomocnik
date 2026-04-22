const BASE = '/api/admin';

function getToken() {
  return localStorage.getItem('adminToken');
}

function authHeaders() {
  return { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
}

async function handleResponse(res) {
  if (res.status === 401) {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
    throw new Error('Relácia vypršala');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Chyba ${res.status}`);
  return data;
}

export async function apiGet(path) {
  return handleResponse(await fetch(`${BASE}${path}`, { headers: authHeaders(), cache: 'no-store' }));
}

export async function apiPost(path, body) {
  return handleResponse(await fetch(`${BASE}${path}`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(body),
  }));
}

export async function apiPut(path, body) {
  return handleResponse(await fetch(`${BASE}${path}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(body),
  }));
}

export async function apiDelete(path) {
  return handleResponse(await fetch(`${BASE}${path}`, {
    method: 'DELETE', headers: authHeaders(),
  }));
}

export async function apiUpload(file) {
  const form = new FormData();
  form.append('file', file);
  const isVideo = file.type.startsWith('video/');
  const res = await fetch(`${BASE}/upload?type=${isVideo ? 'video' : 'image'}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: form,
  });
  return handleResponse(res);
}

export async function login(username, password) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Chyba prihlásenia');
  localStorage.setItem('adminToken', data.token);
  return data;
}

export function logout() {
  localStorage.removeItem('adminToken');
}

export function isLoggedIn() {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
