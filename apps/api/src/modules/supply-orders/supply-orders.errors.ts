export class SupplyOrderError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = 'SupplyOrderError';
  }
}

export function normalizeSupplyOrderMutationError(error: unknown): unknown {
  const cause = error as { code?: number; message?: string } | null;
  if (
    cause?.code === 20 ||
    /transaction numbers are only allowed|transaction.*replica set/i.test(cause?.message || '')
  ) {
    return new SupplyOrderError('Configure o MongoDB como replica set para movimentar estoques com segurança.', 503);
  }
  return error;
}
