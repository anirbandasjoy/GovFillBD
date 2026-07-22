import type { AdapterContext, GovernmentFormAdapter } from '@/adapters/GovernmentFormAdapter';
import { runGenericFill } from '@/autofill/runGenericFill';
import type { FillResult } from '@/autofill/types';
import { detectFields } from '@/field-detector/detectFields';
import type { ApplicantProfile } from '@/schemas/applicantProfile';

export class GenericGovernmentFormAdapter implements GovernmentFormAdapter {
  id = 'generic-government-form';
  name = 'Generic Government Form';

  detect(): boolean {
    const text = document.body.textContent?.toLowerCase() ?? '';
    const host = window.location.hostname.toLowerCase();
    return host.endsWith('.gov.bd') || host.includes('teletalk') || /application|recruitment|admit|প্রার্থী|আবেদন/.test(text);
  }

  scan() {
    return detectFields();
  }

  async fill(profile: ApplicantProfile, context: AdapterContext): Promise<FillResult> {
    return runGenericFill(this.name, this.scan(), profile, context.confidenceThreshold);
  }
}
