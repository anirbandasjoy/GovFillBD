import { resolveAdapter } from '@/adapters';
import type { FillResult } from '@/autofill/types';
import type { ApplicantProfile } from '@/schemas/applicantProfile';

export async function autofillGovernmentApplication(profile: ApplicantProfile, confidenceThreshold = 75): Promise<FillResult> {
  const adapter = resolveAdapter();
  if (!adapter) {
    throw new Error('This page does not look like a supported Bangladesh government job application form.');
  }

  return adapter.fill(profile, { confidenceThreshold });
}
