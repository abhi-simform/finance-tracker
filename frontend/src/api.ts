const BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api';

export function getToken() {
  return localStorage.getItem('token');
}

export async function api(path: string, opts: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : await res.text();
  if (!res.ok) throw new Error((data && data.error) || 'Request failed');
  return data;
}
