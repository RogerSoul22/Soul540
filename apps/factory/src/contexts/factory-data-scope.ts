export type FactoryEventsScope = 'factory' | 'combined';

export function getFactoryEventsScope(isAdmin: boolean): FactoryEventsScope {
  return isAdmin ? 'combined' : 'factory';
}
