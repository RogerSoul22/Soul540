export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function loadMenuOverrides<Menu>(
  storageKey: string,
  storage: KeyValueStorage = window.localStorage,
): Record<string, Menu> {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(storageKey) ?? '{}');
    return isMenuRecord<Menu>(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function saveMenuOverride<Menu>(
  storageKey: string,
  menuId: string,
  menu: Menu,
  storage: KeyValueStorage = window.localStorage,
): Record<string, Menu> {
  const overrides = { ...loadMenuOverrides<Menu>(storageKey, storage), [menuId]: menu };
  storage.setItem(storageKey, JSON.stringify(overrides));
  return overrides;
}

function isMenuRecord<Menu>(value: unknown): value is Record<string, Menu> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
