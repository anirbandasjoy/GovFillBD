import type { AdapterContext, GovernmentFormAdapter } from '@/adapters/GovernmentFormAdapter';
import { runGenericFill } from '@/autofill/runGenericFill';
import type { FillResult } from '@/autofill/types';
import { detectFields } from '@/field-detector/detectFields';
import type { ApplicantProfile } from '@/schemas/applicantProfile';

export class TeletalkAdapter implements GovernmentFormAdapter {
  id = 'teletalk';
  name = 'Teletalk Government Recruitment';

  detect(): boolean {
    const host = window.location.hostname.toLowerCase();
    const text = document.body.textContent?.toLowerCase() ?? '';
    return host.includes('teletalk') || text.includes('teletalk bangladesh limited') || text.includes('government job application');
  }

  scan() {
    return detectFields();
  }

  async fill(profile: ApplicantProfile, context: AdapterContext): Promise<FillResult> {
    return runGenericFill(this.name, this.scan(), profile, context.confidenceThreshold);
  }
}
