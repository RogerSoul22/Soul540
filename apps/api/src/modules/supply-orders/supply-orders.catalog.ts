export type RecipeSupply = {
  id?: string;
  name?: string;
  measure?: string;
  cost?: number;
};

export function mapRecipeSuppliesToCatalog(supplies: RecipeSupply[]) {
  return supplies
    .filter((supply) => supply.id && supply.name?.trim())
    .map((supply) => ({
      id: supply.id!,
      name: supply.name!.trim(),
      measureUnit: supply.measure || 'un',
    }))
    .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));
}
