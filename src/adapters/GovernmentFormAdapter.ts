import type { DetectedField, FillResult } from '@/autofill/types';
import type { ApplicantProfile } from '@/schemas/applicantProfile';

export type AdapterContext = {
  confidenceThreshold: number;
};

export interface GovernmentFormAdapter {
  id: string;
  name: string;
  detect(): boolean;
  scan(): DetectedField[];
  fill(profile: ApplicantProfile, context: AdapterContext): Promise<FillResult>;
}
