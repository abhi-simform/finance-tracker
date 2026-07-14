// FILE: frontend/src/api.ts
const BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api';

export function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Thin typed fetch wrapper used by every page. Throws Error(message) on non-2xx.
 * Callers may pass a generic, e.g. `api<Account[]>('/accounts')`, for typed
 * responses; defaults to `any` to preserve existing untyped call sites.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
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
  if (!res.ok) throw new Error((data && (data as { error?: string }).error) || 'Request failed');
  return data as T;
}
