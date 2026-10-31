export interface MenuItem {
  description: string;
  harmonization?: string;
  id: string;
  name: string;
  price: number;
  subtitle?: string;
}

export interface MenuCategory {
  id: string;
  items: MenuItem[];
  name: string;
}

export interface MenuRecord {
  categories: MenuCategory[];
  createdAt: string;
  eventId?: string;
  footerText: string;
  headerText: string;
  id: string;
  name: string;
}
