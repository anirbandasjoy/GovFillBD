import type { DetectedField, FieldMatch, FillResultItem } from '@/autofill/types';
import { blockedFieldAliases, fieldAliases } from '@/field-matcher/fieldAliases';

const EXACT_ID_SCORE = 100;
const EXACT_LABEL_SCORE = 95;
const NAME_ID_SCORE = 90;
const ALIAS_SCORE = 85;
const PLACEHOLDER_SCORE = 75;
const FUZZY_SCORE = 50;

export function matchFields(fields: DetectedField[], threshold: number): { matches: FieldMatch[]; manual: FillResultItem[]; blocked: FillResultItem[] } {
  const matches: FieldMatch[] = [];
  const manual: FillResultItem[] = [];
  const blocked: FillResultItem[] = [];

  fields.forEach((field) => {
    const fieldLabel = getFieldLabel(field);

    if (isBlockedField(field)) {
      blocked.push({
        label: fieldLabel,
        selector: field.selector,
        status: 'blocked',
        reason: 'CAPTCHA, declaration, submit, upload, payment, and final action fields are never autofilled'
      });
      return;
    }

    const match = findBestMatch(field);
    if (match && match.confidence >= threshold) {
      matches.push(match);
      return;
    }

    manual.push({
      label: fieldLabel,
      selector: field.selector,
      status: 'manual',
      confidence: match?.confidence ?? 0,
      reason: match ? `Low confidence match for ${match.profilePath}` : 'No reliable Bangladesh government profile field match'
    });
  });

  return { matches: sortMatches(matches), manual, blocked };
}

function findBestMatch(field: DetectedField): FieldMatch | undefined {
  let bestMatch: FieldMatch | undefined;

  fieldAliases.forEach((entry) => {
    const candidate = scoreField(field, entry.aliases, entry.path);
    if (!bestMatch || candidate.confidence > bestMatch.confidence) {
      bestMatch = candidate;
    }
  });

  return bestMatch;
}

function scoreField(field: DetectedField, aliases: string[], profilePath: string): FieldMatch {
  const id = normalize(field.id);
  const name = normalize(field.name);
  const label = normalize(field.label);
  const placeholder = normalize(field.placeholder);
  const ariaLabel = normalize(field.ariaLabel);
  const nearbyText = normalize(field.nearbyText);
  const pathTokens = normalize(profilePath.replace(/[.0-9]/g, ' '));
  const normalizedAliases = aliases.map(normalize);

  if (id && normalizedAliases.some((alias) => id === slug(alias))) {
    return createMatch(field, profilePath, EXACT_ID_SCORE, 'Exact ID match');
  }

  if (label && normalizedAliases.some((alias) => label === alias)) {
    return createMatch(field, profilePath, EXACT_LABEL_SCORE, 'Exact label match');
  }

  if (name && normalizedAliases.some((alias) => includesNormalized(name, alias) || includesNormalized(alias, name))) {
    return createMatch(field, profilePath, NAME_ID_SCORE, 'Name attribute match');
  }

  if (id && normalizedAliases.some((alias) => includesNormalized(id, slug(alias)) || includesNormalized(slug(alias), id))) {
    return createMatch(field, profilePath, NAME_ID_SCORE, 'ID attribute match');
  }

  if (label && normalizedAliases.some((alias) => includesNormalized(label, alias))) {
    return createMatch(field, profilePath, ALIAS_SCORE, 'Alias label match');
  }

  if (ariaLabel && normalizedAliases.some((alias) => includesNormalized(ariaLabel, alias))) {
    return createMatch(field, profilePath, ALIAS_SCORE, 'ARIA label alias match');
  }

  if (placeholder && normalizedAliases.some((alias) => includesNormalized(placeholder, alias))) {
    return createMatch(field, profilePath, PLACEHOLDER_SCORE, 'Placeholder match');
  }

  if (nearbyText && normalizedAliases.some((alias) => includesNormalized(nearbyText, alias))) {
    return createMatch(field, profilePath, PLACEHOLDER_SCORE, 'Nearby text match');
  }

  const haystack = [id, name, label, placeholder, ariaLabel, nearbyText].join(' ');
  const fuzzyScore = Math.max(...normalizedAliases.map((alias) => tokenOverlap(haystack, alias)), tokenOverlap(haystack, pathTokens));

  return createMatch(field, profilePath, fuzzyScore >= 0.55 ? FUZZY_SCORE : 0, 'Fuzzy token match');
}

function createMatch(field: DetectedField, profilePath: string, confidence: number, reason: string): FieldMatch {
  return {
    selector: field.selector,
    profilePath,
    confidence,
    reason,
    field
  };
}

function isBlockedField(field: DetectedField): boolean {
  const haystack = normalize([field.type, field.id, field.name, field.label, field.placeholder, field.ariaLabel, field.nearbyText].join(' '));
  if (['submit', 'button', 'file', 'image', 'reset'].includes(field.type)) return true;
  return blockedFieldAliases.some((alias) => haystack.includes(normalize(alias)));
}

function sortMatches(matches: FieldMatch[]): FieldMatch[] {
  return [...matches].sort((a, b) => {
    const aScore = dropdownOrderScore(a.profilePath);
    const bScore = dropdownOrderScore(b.profilePath);
    if (aScore !== bScore) return aScore - bScore;
    return b.confidence - a.confidence;
  });
}

function dropdownOrderScore(path: string): number {
  if (path.endsWith('.district')) return 1;
  if (path.endsWith('.upazila')) return 2;
  return 0;
}

function getFieldLabel(field: DetectedField): string {
  return field.label || field.placeholder || field.name || field.id || field.selector;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[_:-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function slug(value: string): string {
  return normalize(value).replace(/\s+/g, '');
}

function includesNormalized(source: string, search: string): boolean {
  return source.includes(search) || slug(source).includes(slug(search));
}

function tokenOverlap(source: string, search: string): number {
  const sourceTokens = new Set(normalize(source).split(' ').filter((token) => token.length > 1));
  const searchTokens = normalize(search).split(' ').filter((token) => token.length > 1);
  if (sourceTokens.size === 0 || searchTokens.length === 0) return 0;
  const matched = searchTokens.filter((token) => sourceTokens.has(token)).length;
  return matched / searchTokens.length;
}
