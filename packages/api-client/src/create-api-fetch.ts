export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export type ApiFeedbackKind = 'error' | 'success';
type ApiErrorDetail = { message: string; status: number; kind?: ApiFeedbackKind };

export type ApiSystem = 'factory' | 'franchise';

export interface ApiClientOptions {
  baseUrl?: string;
  system?: ApiSystem;
  franchiseId?: string;
}

export const SILENT_ERRORS_HEADER = 'X-Silent-Errors';

function notifyApiError(detail: ApiErrorDetail) {
  window.dispatchEvent(new CustomEvent<ApiErrorDetail>('soul540:api-error', { detail }));
}

export function notifyFeedback(message: string) {
  notifyApiError({ message, status: 0, kind: 'error' });
}

export function notifySuccess(message: string) {
  notifyApiError({ message, status: 0, kind: 'success' });
}

function defaultErrorMessage(status: number) {
  if (status === 401) return 'Sua sessão expirou. Entre novamente para continuar.';
  if (status === 403) return 'Você não tem permissão para realizar esta ação.';
  if (status === 404) return 'O registro solicitado não foi encontrado.';
  if (status >= 500) return 'O servidor não conseguiu concluir a operação. Tente novamente.';
  return 'Não foi possível concluir a operação. Verifique os dados e tente novamente.';
}

async function responseError(response: Response) {
  let message = defaultErrorMessage(response.status);

  try {
    const payload = await response.clone().json();
    if (typeof payload?.error === 'string' && payload.error.trim()) message = payload.error;
    if (typeof payload?.error?.message === 'string' && payload.error.message.trim()) {
      message = payload.error.message;
    }
  } catch {}

  return new ApiRequestError(response.status, message);
}

function createHeaders(options: RequestInit, system?: ApiSystem, franchiseId?: string) {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (system) headers.set('X-System', system);
  if (franchiseId) headers.set('X-Franchise-Id', franchiseId);
  new Headers(options.headers).forEach((value, name) => headers.set(name, value));
  return headers;
}

async function unwrapResponseEnvelope(response: Response) {
  if (!(response.headers.get('content-type') || '').includes('application/json')) return response;
  let payload: unknown;
  try {
    payload = await response.clone().json();
  } catch {
    return response;
  }
  if (!payload || typeof payload !== 'object' || !('success' in payload) || payload.success !== true) {
    return response;
  }
  const data = (payload as { data?: unknown }).data;
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(JSON.stringify(data), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function createApiFetch({ baseUrl = '', system, franchiseId }: ApiClientOptions = {}) {
  return async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
    let response: Response;
    // Cabeçalho interno: a tela mostra o erro por conta própria, sem o aviso global.
    const silent = new Headers(options.headers).has(SILENT_ERRORS_HEADER);
    const headers = createHeaders(options, system, franchiseId);
    headers.delete(SILENT_ERRORS_HEADER);

    try {
      response = await fetch(`${baseUrl}${path}`, { ...options, credentials: 'include', headers });
    } catch {
      const error = new ApiRequestError(
        0,
        'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
      );
      if (!silent) notifyApiError(error);
      throw error;
    }

    if (response.status === 401 && !path.startsWith('/api/auth/')) {
      window.dispatchEvent(new Event('soul540:unauthorized'));
    }

    if (!response.ok) {
      const error = await responseError(response);
      if (!silent && !path.startsWith('/api/auth/')) notifyApiError(error);
      throw new ApiRequestError(error.status, error.message);
    }

    return unwrapResponseEnvelope(response);
  };
}
