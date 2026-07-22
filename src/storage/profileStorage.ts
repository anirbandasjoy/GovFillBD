import { ApplicantProfileSchema, type ApplicantProfile } from '@/schemas/applicantProfile';
import { defaultStorage, type FieldMappingStore, type GovApplySettings, type GovApplyStorage } from '@/storage/storageTypes';

const STORAGE_KEY = 'govapply:v1';

async function getRawStorage(): Promise<Partial<GovApplyStorage>> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] ?? {}) as Partial<GovApplyStorage>;
}

async function setRawStorage(data: GovApplyStorage): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: data });
}

function normalizeStorage(raw: Partial<GovApplyStorage>): GovApplyStorage {
  const profiles = Array.isArray(raw.profiles)
    ? raw.profiles.map((profile) => ApplicantProfileSchema.parse(profile))
    : [];

  return {
    version: raw.version ?? defaultStorage.version,
    profiles,
    settings: {
      ...defaultStorage.settings,
      ...(raw.settings ?? {}),
      neverAutoSubmit: true
    },
    fieldMappings: raw.fieldMappings ?? defaultStorage.fieldMappings
  };
}

export async function getGovApplyStorage(): Promise<GovApplyStorage> {
  return normalizeStorage(await getRawStorage());
}

export async function saveGovApplyStorage(data: GovApplyStorage): Promise<void> {
  await setRawStorage({
    ...data,
    settings: {
      ...data.settings,
      neverAutoSubmit: true
    }
  });
}

export async function listProfiles(): Promise<ApplicantProfile[]> {
  return (await getGovApplyStorage()).profiles;
}

export async function getProfile(profileId: string): Promise<ApplicantProfile | undefined> {
  return (await listProfiles()).find((profile) => profile.profileId === profileId);
}

export async function upsertProfile(profile: ApplicantProfile): Promise<ApplicantProfile> {
  const parsed = ApplicantProfileSchema.parse({
    ...profile,
    updatedAt: new Date().toISOString()
  });
  const storage = await getGovApplyStorage();
  const existingIndex = storage.profiles.findIndex((item) => item.profileId === parsed.profileId);

  if (existingIndex >= 0) {
    storage.profiles[existingIndex] = parsed;
  } else {
    storage.profiles.push(parsed);
  }

  await saveGovApplyStorage(storage);
  return parsed;
}

export async function deleteProfile(profileId: string): Promise<void> {
  const storage = await getGovApplyStorage();
  await saveGovApplyStorage({
    ...storage,
    profiles: storage.profiles.filter((profile) => profile.profileId !== profileId)
  });
}

export async function updateSettings(settings: Partial<GovApplySettings>): Promise<GovApplySettings> {
  const storage = await getGovApplyStorage();
  const nextSettings: GovApplySettings = {
    ...storage.settings,
    ...settings,
    neverAutoSubmit: true
  };
  await saveGovApplyStorage({ ...storage, settings: nextSettings });
  return nextSettings;
}

export async function updateFieldMappings(fieldMappings: FieldMappingStore): Promise<FieldMappingStore> {
  const storage = await getGovApplyStorage();
  await saveGovApplyStorage({ ...storage, fieldMappings });
  return fieldMappings;
}
