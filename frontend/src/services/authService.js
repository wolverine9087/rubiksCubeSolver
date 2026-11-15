import { request } from './api.js'

const TOKEN_KEY = 'cubeflow_token'

export async function login(credentials) {
  const result = await request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
  localStorage.setItem(TOKEN_KEY, result.token)
  return result.user
}

export async function register(details) {
  const result = await request('/auth/register', { method: 'POST', body: JSON.stringify(details) })
  localStorage.setItem(TOKEN_KEY, result.token)
  return result.user
}

export async function getCurrentUser() {
  const result = await request('/auth/me')
  return result.user
}

export async function logout() {
  try { await request('/auth/logout', { method: 'POST' }) } catch { /* The browser session still clears when the API is unavailable. */ } finally { localStorage.removeItem(TOKEN_KEY) }
}

export function hasSession() { return Boolean(localStorage.getItem(TOKEN_KEY)) }
