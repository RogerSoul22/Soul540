export type ApiFetch = (path: string, options?: RequestInit) => Promise<Response>;
export type StyleMap = Record<string, string>;

export interface AppUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  permissions: string[];
  unit?: string;
}

export interface AuthUser {
  isAdmin?: boolean;
  unit?: string;
}

export interface PermissionPage {
  key: string;
  label: string;
}

export interface PermissionGroup {
  group: string;
  items: PermissionPage[];
}

export interface PermissionDirectoryConfig {
  displayUnit: string;
  groups: PermissionGroup[];
  unit: 'factory' | 'franchise';
}

export interface NewUserForm {
  email: string;
  isAdmin: boolean;
  name: string;
  password: string;
}

export const unitLabels: Record<string, string> = {
  main: 'Principal',
  factory: 'Fábrica',
  franchise: 'Itu',
};

export const emptyNewUserForm: NewUserForm = {
  name: '',
  email: '',
  password: '',
  isAdmin: false,
};
