import type { ApplicantProfile } from '@/schemas/applicantProfile';
import type { FillResponse } from '@/autofill/types';

export type StartFillMessage = {
  type: 'GOVAPPLY_START_FILL';
  profileId: string;
};

export type ContentFillMessage = {
  type: 'GOVAPPLY_FILL_FORM';
  profile: ApplicantProfile;
  confidenceThreshold: number;
};

export type GovApplyMessage = StartFillMessage | ContentFillMessage;

export type GovApplyMessageResponse = FillResponse;
