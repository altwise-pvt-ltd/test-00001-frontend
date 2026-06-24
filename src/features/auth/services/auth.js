import client from './client';

// Login: returns { accessToken, tokenType, expiresIn }. Refresh token is set
// by the server as an httpOnly cookie (we never see it).
export async function login(email, password) {
  const { data } = await client.post('/auth/login', { email, password });
  return data.data; // { accessToken, tokenType, expiresIn }
}

export async function logout() {
  await client.post('/auth/logout');
}

// Called on app load: the access token in memory is gone after a page refresh,
// but the 7-day refresh cookie may still be valid. If so, this returns a fresh
// access token and the user stays logged in.
export async function bootstrapSession() {
  const { data } = await client.post('/auth/refresh');
  return data.data; // { accessToken, ... }
}

// Current user (sanitized) — used to populate role/profile after auth.
// The backend names the platform role 'super-admin', but the whole frontend
// (router, navItems, useRole) is coded against 'admin'. Normalize once here so
// that single convention holds everywhere downstream.
export async function fetchMe() {
  const { data } = await client.get('/auth/me');
  const user = data.data;
  if (user?.role === 'super-admin') return { ...user, role: 'admin' };
  return user;
}

// Role-aware dashboard payload.
export async function fetchHome() {
  const { data } = await client.get('/home');
  return data.data;
}