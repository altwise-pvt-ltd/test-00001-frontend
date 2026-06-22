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
export async function fetchMe() {
  const { data } = await client.get('/auth/me');
  return data.data;
}

// Role-aware dashboard payload.
export async function fetchHome() {
  const { data } = await client.get('/home');
  return data.data;
}