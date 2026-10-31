export type EventOption = {
  id?: string;
  _id?: string;
  name?: string;
  celebration?: string;
  date?: string;
  time?: string;
  location?: string;
  city?: string;
  guestCount?: number;
  guestsAdult?: number;
  guestsTeen?: number;
  guestsChild?: number;
  menu?: string[];
  estimatedPizzas?: number;
};

export type ChecklistItem = {
  id: string;
  text: string;
};

export type StoredChecklist = {
  items: ChecklistItem[];
  checked: Record<string, boolean>;
};

export type ChecklistEnvioPageProps = {
  apiFetch: (path: string, options?: RequestInit) => Promise<Response>;
  storageScope: string;
  systemName: string;
};

export type ChecklistMeta = {
  label: string;
  value: string;
};
