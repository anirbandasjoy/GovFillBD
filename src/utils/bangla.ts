import type { DetectedField } from '@/autofill/types';

const banglaUnicodePattern = /[\u0980-\u09FF]/;
const latinLetterPattern = /[A-Za-z]/;
const banglaOnlyPattern = /^[\u0980-\u09FF\s.,:;!?।'"()\-\/]+$/;

const banglaTextMarkers = ['bangla', 'bengali', 'বাংলা', 'বাংলায়', 'বাংলায়', 'unicode'];
const englishTextMarkers = ['english', 'ইংরেজি'];

export function hasBanglaUnicode(value: string): boolean {
  return banglaUnicodePattern.test(value);
}

export function isBanglaUnicodeText(value: string): boolean {
  const trimmed = value.trim();
  return Boolean(trimmed) && hasBanglaUnicode(trimmed) && !latinLetterPattern.test(trimmed) && banglaOnlyPattern.test(trimmed);
}

export function fieldRequiresBanglaUnicode(field: DetectedField, profilePath?: string): boolean {
  if (profilePath?.endsWith('Bangla')) return true;

  const haystack = getFieldLanguageText(field);
  return banglaTextMarkers.some((marker) => haystack.includes(marker));
}

export function fieldExplicitlyRequestsEnglish(field: DetectedField): boolean {
  const haystack = getFieldLanguageText(field);
  return englishTextMarkers.some((marker) => haystack.includes(marker));
}

export function isBanglaPersonalNameLabel(field: DetectedField): boolean {
  if (fieldExplicitlyRequestsEnglish(field)) return false;

  const haystack = getFieldLanguageText(field);
  if (!hasBanglaUnicode(haystack)) return false;

  return ['নাম', 'প্রার্থী', 'আবেদনকারী', 'পিতা', 'মাতা'].some((marker) => haystack.includes(marker));
}

function getFieldLanguageText(field: DetectedField): string {
  return [field.id, field.name, field.label, field.placeholder, field.ariaLabel, field.nearbyText]
    .join(' ')
    .toLowerCase()
    .replace(/[_:-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
