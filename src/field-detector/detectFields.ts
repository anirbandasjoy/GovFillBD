import type { DetectedField, FieldKind } from '@/autofill/types';

const fieldSelector = 'input, textarea, select';

export function detectFields(root: Document = document): DetectedField[] {
  return Array.from(root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(fieldSelector))
    .filter((element) => isVisibleField(element))
    .map((element) => toDetectedField(element));
}

function toDetectedField(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): DetectedField {
  const tag = element.tagName.toLowerCase();
  const inputType = element instanceof HTMLInputElement ? element.type.toLowerCase() : tag;
  const kind = getFieldKind(element);

  return {
    selector: buildSelector(element),
    kind,
    type: inputType,
    id: element.id ?? '',
    name: element.getAttribute('name') ?? '',
    label: findLabelText(element),
    placeholder: element.getAttribute('placeholder') ?? '',
    ariaLabel: element.getAttribute('aria-label') ?? '',
    nearbyText: findNearbyText(element),
    options: element instanceof HTMLSelectElement ? Array.from(element.options).map((option) => option.textContent?.trim() ?? '').filter(Boolean) : []
  };
}

function getFieldKind(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): FieldKind {
  if (element instanceof HTMLTextAreaElement) return 'textarea';
  if (element instanceof HTMLSelectElement) return 'select';
  if (element.type === 'radio') return 'radio';
  if (element.type === 'checkbox') return 'checkbox';
  if (element.type === 'date') return 'date';
  return 'input';
}

function isVisibleField(element: HTMLElement): boolean {
  if (element instanceof HTMLInputElement && element.type === 'hidden') return false;
  if (element.hasAttribute('disabled') || element.hasAttribute('readonly')) return false;
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
}

function findLabelText(element: HTMLElement): string {
  const labels: string[] = [];

  if (element.id) {
    const label = document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
    if (label?.textContent) labels.push(label.textContent);
  }

  const wrappingLabel = element.closest('label');
  if (wrappingLabel?.textContent) labels.push(wrappingLabel.textContent);

  const parentLabel = element.parentElement?.querySelector('label');
  if (parentLabel?.textContent) labels.push(parentLabel.textContent);

  return cleanText(labels.join(' '));
}

function findNearbyText(element: HTMLElement): string {
  const textParts: string[] = [];
  const parent = element.parentElement;
  const previous = element.previousElementSibling;

  if (previous?.textContent) textParts.push(previous.textContent);
  if (parent?.textContent) textParts.push(parent.textContent.replace(element.textContent ?? '', ''));

  const row = element.closest('tr, .row, .form-group, .form-row, div');
  if (row?.textContent) textParts.push(row.textContent);

  return cleanText(textParts.join(' ')).slice(0, 250);
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function buildSelector(element: HTMLElement): string {
  if (element.id) return `#${CSS.escape(element.id)}`;

  const name = element.getAttribute('name');
  if (name) return `${element.tagName.toLowerCase()}[name="${CSS.escape(name)}"]`;

  const parts: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body && parts.length < 4) {
    const tag = current.tagName.toLowerCase();
    const siblings = current.parentElement ? Array.from(current.parentElement.children).filter((child) => child.tagName === current?.tagName) : [];
    const index = siblings.indexOf(current) + 1;
    parts.unshift(siblings.length > 1 ? `${tag}:nth-of-type(${index})` : tag);
    current = current.parentElement;
  }

  return parts.join(' > ');
}
