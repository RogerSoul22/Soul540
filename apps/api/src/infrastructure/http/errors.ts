export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function normalizeApiError(error: any) {
  if (error instanceof ApiError) {
    return { status: error.status, code: error.code, message: error.message, details: error.details };
  }
  if (error?.name === 'ZodError' || error?.name === 'ValidationError') {
    return { status: 400, code: 'validation_error', message: 'Dados inválidos' };
  }
  if (error?.code === 11000) {
    return { status: 409, code: 'conflict', message: 'Registro duplicado' };
  }
  if (error?.type === 'entity.too.large' || error?.status === 413) {
    return { status: 413, code: 'payload_too_large', message: 'Payload excede o limite permitido' };
  }
  const status = Number(error?.status || error?.statusCode);
  if (status >= 400 && status < 500 && typeof error?.code === 'string') {
    return { status, code: error.code, message: error.message || 'Requisição inválida' };
  }
  return { status: 500, code: 'internal_error', message: 'Erro interno do servidor' };
}
