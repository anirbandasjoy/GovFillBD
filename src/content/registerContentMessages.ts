import { autofillGovernmentApplication } from '@/autofill/autofillEngine';
import type { FillResponse } from '@/autofill/types';
import type { GovApplyMessage } from '@/utils/messages';

export function registerContentMessages() {
  chrome.runtime.onMessage.addListener((message: GovApplyMessage, _sender, sendResponse: (response: FillResponse) => void) => {
    if (message.type !== 'GOVAPPLY_FILL_FORM') return false;

    void autofillGovernmentApplication(message.profile, message.confidenceThreshold)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error: unknown) => sendResponse({ ok: false, error: error instanceof Error ? error.message : 'Unable to autofill this form.' }));

    return true;
  });
}
