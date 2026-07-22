import type { FillResponse } from '@/autofill/types';
import { getGovApplyStorage, getProfile, listProfiles } from '@/storage/profileStorage';
import type { GovApplyMessage } from '@/utils/messages';

export function registerBackgroundMessages() {
  void chrome.action.setPopup({ popup: '' });

  chrome.action.onClicked.addListener(() => {
    void handleActionClick();
  });

  chrome.runtime.onMessage.addListener((message: GovApplyMessage, _sender, sendResponse: (response: FillResponse) => void) => {
    if (message.type !== 'GOVAPPLY_START_FILL') return false;

    void handleStartFill(message.profileId).then(sendResponse);
    return true;
  });
}

async function handleActionClick(): Promise<void> {
  const profiles = await listProfiles();

  if (profiles.length === 0) {
    await openProfilesPage();
    return;
  }

  await openProfilePickerPopup();
}

async function openProfilesPage(): Promise<void> {
  await chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
}

async function openProfilePickerPopup(): Promise<void> {
  await chrome.action.setPopup({ popup: 'profile-picker.html' });

  const action = chrome.action as typeof chrome.action & {
    openPopup?: () => Promise<void>;
  };

  if (action.openPopup) {
    await action.openPopup();
    window.setTimeout(() => {
      void chrome.action.setPopup({ popup: '' });
    }, 500);
    return;
  }

  await chrome.tabs.create({ url: chrome.runtime.getURL('profile-picker.html') });
  await chrome.action.setPopup({ popup: '' });
}

async function handleStartFill(profileId: string): Promise<FillResponse> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return { ok: false, error: 'No active tab found.' };
  if (!tab.url || /^chrome:|^edge:|^about:/.test(tab.url)) return { ok: false, error: 'Chrome internal pages cannot be autofilled.' };

  const profile = await getProfile(profileId);
  if (!profile) return { ok: false, error: 'Selected applicant profile was not found.' };
  const storage = await getGovApplyStorage();

  try {
    const response = (await chrome.tabs.sendMessage(tab.id, {
      type: 'GOVAPPLY_FILL_FORM',
      profile,
      confidenceThreshold: storage.settings.fillConfidenceThreshold
    })) as FillResponse;
    return response;
  } catch {
    return { ok: false, error: 'GovApply content script is not available on this page. Refresh the page and try again.' };
  }
}
