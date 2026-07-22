import type { FieldMatch, FillResultItem } from '@/autofill/types';
import type { ApplicantProfile } from '@/schemas/applicantProfile';
import { getProfileValue } from '@/field-filler/getProfileValue';

export async function fillField(match: FieldMatch, profile: ApplicantProfile): Promise<FillResultItem> {
  const element = document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(match.selector);
  const rawValue = getProfileValue(profile, match.profilePath);
  const value = stringifyValue(rawValue);
  const label = match.field.label || match.field.placeholder || match.field.name || match.field.id || match.selector;

  if (!element) {
    return createItem(match, label, value, 'skipped', 'Field disappeared before filling');
  }

  if (!value) {
    return createItem(match, label, value, 'skipped', `No saved value for ${match.profilePath}`);
  }

  if (element instanceof HTMLInputElement && ['submit', 'button', 'file', 'image', 'reset'].includes(element.type)) {
    return createItem(match, label, value, 'blocked', 'Unsafe input type is never autofilled');
  }

  if (element instanceof HTMLSelectElement) {
    const filled = await fillSelect(element, value, match.profilePath);
    return createItem(match, label, value, filled ? 'filled' : 'manual', filled ? match.reason : 'No matching select option found');
  }

  if (element instanceof HTMLInputElement && element.type === 'radio') {
    const filled = fillRadio(element, value);
    return createItem(match, label, value, filled ? 'filled' : 'manual', filled ? match.reason : 'No matching radio option found');
  }

  if (element instanceof HTMLInputElement && element.type === 'checkbox') {
    if (isDeclarationLike(match)) return createItem(match, label, value, 'blocked', 'Declaration checkbox is never accepted automatically');
    element.checked = toBoolean(value);
    dispatchFieldEvents(element);
    return createItem(match, label, value, 'filled', match.reason);
  }

  element.focus();
  element.value = value;
  dispatchFieldEvents(element);
  return createItem(match, label, value, 'filled', match.reason);
}

function fillRadio(element: HTMLInputElement, value: string): boolean {
  const groupName = element.name;
  const candidates = groupName
    ? Array.from(document.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${CSS.escape(groupName)}"]`))
    : [element];

  const normalizedValue = normalize(value);
  const target = candidates.find((candidate) => normalize(candidate.value) === normalizedValue || normalize(getRadioLabel(candidate)).includes(normalizedValue));
  if (!target) return false;

  target.checked = true;
  dispatchFieldEvents(target);
  return true;
}

async function fillSelect(element: HTMLSelectElement, value: string, profilePath: string): Promise<boolean> {
  if (profilePath.endsWith('.upazila')) {
    await waitForSelectOptions(element);
  }

  const normalizedValue = normalize(value);
  const option = Array.from(element.options).find((candidate) => {
    const text = normalize(candidate.textContent ?? '');
    const optionValue = normalize(candidate.value);
    return optionValue === normalizedValue || text === normalizedValue || text.includes(normalizedValue) || normalizedValue.includes(text);
  });

  if (!option) return false;
  element.value = option.value;
  dispatchFieldEvents(element);

  if (profilePath.endsWith('.district')) {
    await sleep(350);
  }

  return true;
}

async function waitForSelectOptions(element: HTMLSelectElement): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < 2500) {
    if (element.options.length > 1) return;
    await sleep(100);
  }
}

function dispatchFieldEvents(element: HTMLElement) {
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

function getRadioLabel(element: HTMLInputElement): string {
  if (element.id) {
    const label = document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
    if (label?.textContent) return label.textContent;
  }
  return element.closest('label')?.textContent ?? '';
}

function stringifyValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value == null) return '';
  return String(value).trim();
}

function toBoolean(value: string): boolean {
  return ['yes', 'true', '1', 'available', 'applicable'].includes(normalize(value));
}

function isDeclarationLike(match: FieldMatch): boolean {
  const haystack = normalize([match.field.label, match.field.name, match.field.id, match.field.nearbyText].join(' '));
  return haystack.includes('declaration') || haystack.includes('i agree') || haystack.includes('ঘোষণা');
}

function createItem(match: FieldMatch, label: string, value: string, status: FillResultItem['status'], reason: string): FillResultItem {
  return {
    label,
    selector: match.selector,
    profilePath: match.profilePath,
    value,
    status,
    confidence: match.confidence,
    reason
  };
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
