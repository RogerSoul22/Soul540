import type { AppUser } from '../types/permissions-types';
import { SYSTEM_LABELS } from '../types/permissions-types';

export function groupUsersByUnit(users: AppUser[]) {
  const groups: Record<string, AppUser[]> = {};
  for (const user of users) {
    const key = user.unit || 'main';
    if (!groups[key]) groups[key] = [];
    groups[key].push(user);
  }
  return Object.entries(groups).map(([key, groupedUsers]) => ({
    label: SYSTEM_LABELS[key] || key,
    users: groupedUsers,
  }));
}

export function getInitials(name?: string) {
  return (
    (name || '??')
      .split(' ')
      .map((word) => word[0] || '')
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??'
  );
}
