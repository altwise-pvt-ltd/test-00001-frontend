import { env } from '../../config/env'

// Thrown for any non-2xx response so callers can branch on status.
export class ApiError extends Error {
  constructor(status, payload) {
    super(`API request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

async function safeParse(res) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * Minimal fetch wrapper around the backend API.
 * Swap this for TanStack Query / axios later — features only import the
 * helpers below, so the underlying transport can change without touching them.
 *
 * @param {string} path  Path appended to the API base URL, e.g. '/users'.
 * @param {{ method?: string, body?: unknown, headers?: object, signal?: AbortSignal }} [options]
 */
export async function apiClient(path, { method = 'GET', body, headers, signal } = {}) {
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  })

  if (!res.ok) {
    throw new ApiError(res.status, await safeParse(res))
  }

  return res.status === 204 ? null : safeParse(res)
}

export const api = {
  get: (path, options) => apiClient(path, { ...options, method: 'GET' }),
  post: (path, body, options) => apiClient(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => apiClient(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => apiClient(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => apiClient(path, { ...options, method: 'DELETE' }),
}
