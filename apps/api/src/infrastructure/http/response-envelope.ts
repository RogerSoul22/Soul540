type ResponseEnvelope =
  | { success: true; data: unknown }
  | { success: false; error: { code: string; message: string; details?: unknown; requestId?: string } };

function isEnvelope(body: unknown): body is ResponseEnvelope {
  return Boolean(body && typeof body === 'object' && 'success' in body);
}

function errorEnvelope(body: unknown): ResponseEnvelope {
  const rawError = body && typeof body === 'object' && 'error' in body ? body.error : body;
  if (rawError && typeof rawError === 'object' && 'message' in rawError) {
    const error = rawError as { code?: string; message: string; details?: unknown; requestId?: string };
    return {
      success: false,
      error: {
        code: error.code || 'HTTP_ERROR',
        message: error.message,
        ...(error.details !== undefined && { details: error.details }),
        ...(error.requestId !== undefined && { requestId: error.requestId }),
      },
    };
  }
  return {
    success: false,
    error: { code: 'HTTP_ERROR', message: typeof rawError === 'string' ? rawError : 'Erro na requisição' },
  };
}

export function toResponseEnvelope(status: number, body: unknown): ResponseEnvelope | unknown {
  if (isEnvelope(body)) return body;
  if (status >= 400) return errorEnvelope(body);
  return { success: true, data: body };
}

export function responseEnvelope(_req: unknown, res: any, next: () => void) {
  const json = res.json.bind(res);
  res.json = (body: unknown) => json(toResponseEnvelope(res.statusCode, body));
  next();
}
