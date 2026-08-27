const BASE = import.meta.env.VITE_API_URL || '';

export class ApiRequestError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

type ApiErrorDetail = { message: string; status: number };

const notifyApiError = (detail: ApiErrorDetail) => {
  window.dispatchEvent(new CustomEvent<ApiErrorDetail>('soul540:api-error', { detail }));
};

const defaultErrorMessage = (status: number) => {
  if (status === 401) return 'Sua sessão expirou. Entre novamente para continuar.';
  if (status === 403) return 'Você não tem permissão para realizar esta ação.';
  if (status === 404) return 'O registro solicitado não foi encontrado.';
  if (status >= 500) return 'O servidor não conseguiu concluir a operação. Tente novamente.';
  return 'Não foi possível concluir a operação. Verifique os dados e tente novamente.';
};

const responseError = async (response: Response) => {
  let message = defaultErrorMessage(response.status);
  try {
    const payload = await response.clone().json();
    if (typeof payload?.error === 'string' && payload.error.trim()) message = payload.error;
  } catch {}
  return new ApiRequestError(response.status, message);
};

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-System': 'factory',
        ...(options.headers as Record<string, string> || {}),
      },
    });
  } catch {
    const error = new ApiRequestError(0, 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.');
    notifyApiError(error);
    throw error;
  }

  if (response.status === 401 && !path.startsWith('/api/auth/')) {
    window.dispatchEvent(new Event('soul540:unauthorized'));
  }

  if (!response.ok) {
    const error = await responseError(response);
    if (!path.startsWith('/api/auth/')) notifyApiError(error);
    throw new ApiRequestError(error.status, error.message);
  }

  return response;
}
