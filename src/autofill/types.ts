export type FieldKind = 'input' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';

export type DetectedField = {
  selector: string;
  kind: FieldKind;
  type: string;
  id: string;
  name: string;
  label: string;
  placeholder: string;
  ariaLabel: string;
  nearbyText: string;
  options: string[];
};

export type FieldMatch = {
  selector: string;
  profilePath: string;
  confidence: number;
  reason: string;
  field: DetectedField;
};

export type FillResultItem = {
  label: string;
  selector?: string;
  profilePath?: string;
  value?: string;
  status: 'filled' | 'skipped' | 'manual' | 'blocked';
  confidence?: number;
  reason: string;
};

export type FillResult = {
  adapter: string;
  totalFields: number;
  filled: number;
  skipped: number;
  manual: number;
  blocked: number;
  items: FillResultItem[];
};

export type FillRequest = {
  profileId: string;
};

export type FillResponse =
  | { ok: true; result: FillResult }
  | { ok: false; error: string };
