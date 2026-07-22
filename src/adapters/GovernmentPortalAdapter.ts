import type { AdapterContext, GovernmentFormAdapter } from '@/adapters/GovernmentFormAdapter';
import { runGenericFill } from '@/autofill/runGenericFill';
import type { FillResult } from '@/autofill/types';
import { detectFields } from '@/field-detector/detectFields';
import type { ApplicantProfile } from '@/schemas/applicantProfile';

export class GovernmentPortalAdapter implements GovernmentFormAdapter {
  id = 'government-portal';
  name = 'Bangladesh Government Portal';

  detect(): boolean {
    const host = window.location.hostname.toLowerCase();
    const text = document.body.textContent?.toLowerCase() ?? '';
    return host.endsWith('.gov.bd') || /ministry|department|commission|university|institute|recruitment|circular|নিয়োগ|আবেদন/.test(text);
  }

  scan() {
    return detectFields();
  }

  async fill(profile: ApplicantProfile, context: AdapterContext): Promise<FillResult> {
    return runGenericFill(this.name, this.scan(), profile, context.confidenceThreshold);
  }
}
