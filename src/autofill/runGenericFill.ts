import type { DetectedField, FillResult, FillResultItem } from '@/autofill/types';
import { fillField } from '@/field-filler/fillField';
import { matchFields } from '@/field-matcher/matchFields';
import type { ApplicantProfile } from '@/schemas/applicantProfile';

export async function runGenericFill(adapterName: string, fields: DetectedField[], profile: ApplicantProfile, confidenceThreshold: number): Promise<FillResult> {
  const { matches, manual, blocked } = matchFields(fields, confidenceThreshold);
  const filledItems: FillResultItem[] = [];

  for (const match of matches) {
    filledItems.push(await fillField(match, profile));
  }

  const items = [...filledItems, ...manual, ...blocked];

  return {
    adapter: adapterName,
    totalFields: fields.length,
    filled: items.filter((item) => item.status === 'filled').length,
    skipped: items.filter((item) => item.status === 'skipped').length,
    manual: items.filter((item) => item.status === 'manual').length,
    blocked: items.filter((item) => item.status === 'blocked').length,
    items
  };
}
