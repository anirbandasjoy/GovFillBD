export function formatDateTime(value: string): string {
  if (!value) return 'Never';

  try {
    return new Intl.DateTimeFormat('en-BD', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  } catch {
    return value;
  }
}
