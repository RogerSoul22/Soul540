const BASE = import.meta.env.VITE_API_URL || '';

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-System': 'factory',
      ...(options.headers as Record<string, string> || {}),
    },
  });

  if (response.status === 401 && !path.startsWith('/api/auth/')) {
    window.dispatchEvent(new Event('soul540:unauthorized'));
  }

  return response;
}
