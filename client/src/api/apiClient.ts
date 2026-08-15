export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers || {})

  if (init?.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  let targetUrl = input
  if (typeof input === 'string' && input.startsWith('/api') && baseUrl) {
    targetUrl = `${baseUrl.replace(/\/$/, '')}${input}`
  }

  const options: RequestInit = {
    ...init,
    headers,
    credentials: 'include',
  }

  return fetch(targetUrl, options)
}
