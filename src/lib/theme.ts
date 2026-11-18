export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

export function parseTheme(value: unknown): Theme | null {
  return value === 'light' || value === 'dark' ? value : null;
}

export function resolveTheme(chosen: Theme | null, systemPrefersDark: boolean): Theme {
  return chosen ?? (systemPrefersDark ? 'dark' : 'light');
}

export function toggleTheme(current: Theme): Theme {
  return current === 'dark' ? 'light' : 'dark';
}
