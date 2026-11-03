export const PRODUCTION_ORDER_UNITS = ['main', 'franchise', 'factory'] as const;
export type ProductionOrderUnit = (typeof PRODUCTION_ORDER_UNITS)[number];

export function getFactoryProductionOrderFilter(
  filter: Record<string, unknown> = {},
  requestedUnit?: unknown,
): Record<string, unknown> {
  const unit = PRODUCTION_ORDER_UNITS.includes(requestedUnit as ProductionOrderUnit)
    ? requestedUnit
    : { $in: [...PRODUCTION_ORDER_UNITS] };
  return { ...filter, unit };
}
