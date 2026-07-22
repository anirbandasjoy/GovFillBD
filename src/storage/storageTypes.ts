import type { ApplicantProfile } from '@/schemas/applicantProfile';

export const STORAGE_VERSION = 1;

export type FieldMappingStore = Record<string, Record<string, string>>;

export type GovApplySettings = {
  encryptionEnabled: boolean;
  fillConfidenceThreshold: number;
  neverAutoSubmit: true;
};

export type GovApplyStorage = {
  version: number;
  profiles: ApplicantProfile[];
  settings: GovApplySettings;
  fieldMappings: FieldMappingStore;
};

export const defaultSettings: GovApplySettings = {
  encryptionEnabled: false,
  fillConfidenceThreshold: 75,
  neverAutoSubmit: true
};

export const defaultStorage: GovApplyStorage = {
  version: STORAGE_VERSION,
  profiles: [],
  settings: defaultSettings,
  fieldMappings: {}
};
