export type StaticItem = {
  name: string;
  subtitle?: string;
  description: string;
  harmonization?: string;
};

export type StaticCategory = {
  name: string;
  items: StaticItem[];
};

export type StaticMenu = {
  id: string;
  name: string;
  tagline: string;
  obs?: string;
  categories: StaticCategory[];
};

export function text(...parts: string[]) {
  return parts.join('');
}
