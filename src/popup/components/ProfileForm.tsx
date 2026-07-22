import { useState } from 'react';
import type React from 'react';
import { Button } from '@/popup/components/ui/button';
import { Checkbox } from '@/popup/components/ui/checkbox';
import { Input } from '@/popup/components/ui/input';
import { Label } from '@/popup/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/popup/components/ui/select';
import { Textarea } from '@/popup/components/ui/textarea';
import { createEmptyProfile } from '@/profiles/createEmptyProfile';
import type { ApplicantProfile } from '@/schemas/applicantProfile';

const genderOptions = ['Male', 'Female', 'Other'];
const religionOptions = ['Islam', 'Hinduism', 'Buddhism', 'Christianity', 'Other'];
const maritalOptions = ['Single', 'Married', 'Divorced', 'Widowed'];
const quotaOptions = ['General', 'Freedom Fighter', 'Disabled', 'Orphan', 'Tribal', 'Ansar-VDP', 'Minority', 'Other'];
const resultOptions = ['GPA', 'CGPA', 'Division', 'Class', 'Percentage', 'Other'];
const employmentOptions = ['Government', 'Semi-Government', 'Autonomous', 'Private', 'Project', 'Contract', 'Other'];

type ProfileFormProps = {
  initialProfile?: ApplicantProfile;
  onCancel: () => void;
  onSave: (profile: ApplicantProfile) => Promise<void>;
};

export function ProfileForm({ initialProfile, onCancel, onSave }: ProfileFormProps) {
  const [profile, setProfile] = useState<ApplicantProfile>(() => initialProfile ?? createEmptyProfile(''));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update(path: string, value: string | boolean) {
    setProfile((current) => {
      const next = structuredClone(current);
      setAtPath(next, path, value);
      if (path === 'address.sameAsPresentAddress' && value === true) {
        next.address.permanentAddress = structuredClone(next.address.presentAddress);
      }
      return next;
    });
  }

  async function submit() {
    setSaving(true);
    setError('');
    try {
      await onSave(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save profile');
    } finally {
      setSaving(false);
    }
  }

  function addTraining() {
    setProfile((current) => ({
      ...current,
      training: [...current.training, { trainingName: '', institution: '', duration: '', completionYear: '' }]
    }));
  }

  function addExperience() {
    setProfile((current) => ({
      ...current,
      experiences: [
        ...current.experiences,
        {
          organization: '',
          designation: '',
          employmentType: 'Government',
          address: '',
          startDate: '',
          endDate: '',
          currentlyWorking: false,
          jobDescription: ''
        }
      ]
    }));
  }

  function addPublication() {
    setProfile((current) => ({
      ...current,
      publications: [...current.publications, { title: '', journal: '', publisher: '', publicationDate: '' }]
    }));
  }

  function removeArrayItem(key: 'training' | 'experiences' | 'publications', index: number) {
    setProfile((current) => ({
      ...current,
      [key]: current[key].filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="sticky top-0 z-10 -mx-4 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">{initialProfile ? 'Edit Profile' : 'Create Profile'}</h2>
            <p className="text-xs text-muted-foreground">Bangladesh government application data</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Close
          </Button>
        </div>
      </div>

      <Section title="Profile">
        <TextField label="Profile Name" path="profileName" profile={profile} update={update} />
        <TextField label="Photo URL or Data" path="photo" profile={profile} update={update} />
      </Section>

      <Section title="Personal Information">
        <TextField label="Full Name English" path="personal.fullNameEnglish" profile={profile} update={update} />
        <TextField label="Full Name Bangla" path="personal.fullNameBangla" profile={profile} update={update} />
        <TextField label="Father Name English" path="personal.fatherNameEnglish" profile={profile} update={update} />
        <TextField label="Father Name Bangla" path="personal.fatherNameBangla" profile={profile} update={update} />
        <TextField label="Mother Name English" path="personal.motherNameEnglish" profile={profile} update={update} />
        <TextField label="Mother Name Bangla" path="personal.motherNameBangla" profile={profile} update={update} />
        <TextField label="Date of Birth" type="date" path="personal.dateOfBirth" profile={profile} update={update} />
        <SelectField label="Gender" path="personal.gender" options={genderOptions} profile={profile} update={update} />
        <SelectField label="Religion" path="personal.religion" options={religionOptions} profile={profile} update={update} />
        <TextField label="Nationality" path="personal.nationality" profile={profile} update={update} />
        <SelectField label="Marital Status" path="personal.maritalStatus" options={maritalOptions} profile={profile} update={update} />
      </Section>

      <Section title="Identification">
        <CheckField label="NID Available" path="identification.nationalId.available" profile={profile} update={update} />
        <TextField label="NID Number" path="identification.nationalId.number" profile={profile} update={update} />
        <CheckField label="Birth Registration Available" path="identification.birthRegistration.available" profile={profile} update={update} />
        <TextField label="Birth Registration Number" path="identification.birthRegistration.number" profile={profile} update={update} />
        <CheckField label="Passport Available" path="identification.passport.available" profile={profile} update={update} />
        <TextField label="Passport Number" path="identification.passport.number" profile={profile} update={update} />
      </Section>

      <Section title="Contact">
        <TextField label="Mobile Number" path="contact.mobileNumber" profile={profile} update={update} />
        <TextField label="Email" type="email" path="contact.email" profile={profile} update={update} />
        <TextField label="Alternative Mobile" path="contact.alternativeMobile" profile={profile} update={update} />
      </Section>

      <AddressSection title="Present Address" prefix="address.presentAddress" profile={profile} update={update} />
      <Section title="Permanent Address">
        <CheckField label="Same as Present Address" path="address.sameAsPresentAddress" profile={profile} update={update} />
      </Section>
      {!profile.address.sameAsPresentAddress && (
        <AddressSection title="Permanent Address Details" prefix="address.permanentAddress" profile={profile} update={update} />
      )}

      <Section title="Quota">
        <SelectField label="Quota Type" path="quota.quotaType" options={quotaOptions} profile={profile} update={update} />
      </Section>

      <EducationSection title="SSC" prefix="education.ssc" secondary profile={profile} update={update} />
      <EducationSection title="HSC" prefix="education.hsc" secondary profile={profile} update={update} />
      <EducationSection title="Bachelor / Graduation" prefix="education.bachelor" profile={profile} update={update} />
      <EducationSection title="Masters" prefix="education.masters" profile={profile} update={update} />

      <Section title="MPhil">
        <CheckField label="Applicable" path="education.mphil.applicable" profile={profile} update={update} />
        <ResearchFields prefix="education.mphil" profile={profile} update={update} />
      </Section>

      <Section title="PhD">
        <CheckField label="Applicable" path="education.phd.applicable" profile={profile} update={update} />
        <ResearchFields prefix="education.phd" profile={profile} update={update} />
        <TextField label="Thesis Title" path="education.phd.thesisTitle" profile={profile} update={update} />
      </Section>

      <ArraySection title="Training" onAdd={addTraining} addLabel="Add Training">
        {profile.training.map((_, index) => (
          <div key={index} className="space-y-2 rounded-md border p-3">
            <TextField label="Training Name" path={`training.${index}.trainingName`} profile={profile} update={update} />
            <TextField label="Institution" path={`training.${index}.institution`} profile={profile} update={update} />
            <TextField label="Duration" path={`training.${index}.duration`} profile={profile} update={update} />
            <TextField label="Completion Year" path={`training.${index}.completionYear`} profile={profile} update={update} />
            <Button variant="ghost" size="sm" onClick={() => removeArrayItem('training', index)}>
              Remove Training
            </Button>
          </div>
        ))}
      </ArraySection>

      <ArraySection title="Job Experience" onAdd={addExperience} addLabel="Add More Experience">
        {profile.experiences.map((_, index) => (
          <div key={index} className="space-y-2 rounded-md border p-3">
            <TextField label="Organization" path={`experiences.${index}.organization`} profile={profile} update={update} />
            <TextField label="Designation" path={`experiences.${index}.designation`} profile={profile} update={update} />
            <SelectField label="Employment Type" path={`experiences.${index}.employmentType`} options={employmentOptions} profile={profile} update={update} />
            <TextField label="Address" path={`experiences.${index}.address`} profile={profile} update={update} />
            <TextField label="Start Date" type="date" path={`experiences.${index}.startDate`} profile={profile} update={update} />
            <TextField label="End Date" type="date" path={`experiences.${index}.endDate`} profile={profile} update={update} />
            <CheckField label="Currently Working" path={`experiences.${index}.currentlyWorking`} profile={profile} update={update} />
            <LongTextField label="Job Description" path={`experiences.${index}.jobDescription`} profile={profile} update={update} />
            <Button variant="ghost" size="sm" onClick={() => removeArrayItem('experiences', index)}>
              Remove Experience
            </Button>
          </div>
        ))}
      </ArraySection>

      <ArraySection title="Publications" onAdd={addPublication} addLabel="Add Publication">
        {profile.publications.map((_, index) => (
          <div key={index} className="space-y-2 rounded-md border p-3">
            <TextField label="Title" path={`publications.${index}.title`} profile={profile} update={update} />
            <TextField label="Journal" path={`publications.${index}.journal`} profile={profile} update={update} />
            <TextField label="Publisher" path={`publications.${index}.publisher`} profile={profile} update={update} />
            <TextField label="Publication Date" type="date" path={`publications.${index}.publicationDate`} profile={profile} update={update} />
            <Button variant="ghost" size="sm" onClick={() => removeArrayItem('publications', index)}>
              Remove Publication
            </Button>
          </div>
        ))}
      </ArraySection>

      {error && <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">{error}</p>}

      <div className="sticky bottom-0 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <Button className="w-full" disabled={saving} onClick={submit}>
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border bg-card p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function ArraySection({ title, children, onAdd, addLabel }: { title: string; children: React.ReactNode; onAdd: () => void; addLabel: string }) {
  return (
    <Section title={title ?? 'Address'}>
      <div className="space-y-3">{children}</div>
      <Button variant="outline" size="sm" className="w-full" onClick={onAdd}>
        {addLabel}
      </Button>
    </Section>
  );
}

function AddressSection({ title, prefix, profile, update }: FieldGroupProps) {
  return (
    <Section title={title ?? 'Education'}>
      <TextField label="Care Of" path={`${prefix}.careOf`} profile={profile} update={update} />
      <TextField label="Village / Road / House" path={`${prefix}.villageRoadHouse`} profile={profile} update={update} />
      <TextField label="District" path={`${prefix}.district`} profile={profile} update={update} />
      <TextField label="Upazila" path={`${prefix}.upazila`} profile={profile} update={update} />
      <TextField label="Post Office" path={`${prefix}.postOffice`} profile={profile} update={update} />
      <TextField label="Post Code" path={`${prefix}.postCode`} profile={profile} update={update} />
    </Section>
  );
}

function EducationSection({ title, prefix, secondary = false, profile, update }: FieldGroupProps & { secondary?: boolean }) {
  return (
    <Section title={title ?? 'Education'}>
      <TextField label="Examination" path={`${prefix}.examination`} profile={profile} update={update} />
      {secondary ? (
        <TextField label="Board" path={`${prefix}.board`} profile={profile} update={update} />
      ) : (
        <TextField label="University" path={`${prefix}.university`} profile={profile} update={update} />
      )}
      {!secondary && <TextField label="Degree" path={`${prefix}.degree`} profile={profile} update={update} />}
      {secondary && <TextField label="Roll Number" path={`${prefix}.rollNumber`} profile={profile} update={update} />}
      <SelectField label="Result Type" path={`${prefix}.resultType`} options={resultOptions} profile={profile} update={update} />
      <TextField label="Result Value" path={`${prefix}.resultValue`} profile={profile} update={update} />
      <TextField label={secondary ? 'Group / Subject' : 'Subject'} path={secondary ? `${prefix}.groupSubject` : `${prefix}.subject`} profile={profile} update={update} />
      <TextField label="Passing Year" path={`${prefix}.passingYear`} profile={profile} update={update} />
      {!secondary && <TextField label="Course Duration" path={`${prefix}.courseDuration`} profile={profile} update={update} />}
    </Section>
  );
}

function ResearchFields({ prefix, profile, update }: FieldGroupProps) {
  return (
    <>
      <TextField label="Examination" path={`${prefix}.examination`} profile={profile} update={update} />
      <TextField label="University" path={`${prefix}.university`} profile={profile} update={update} />
      <TextField label="Degree" path={`${prefix}.degree`} profile={profile} update={update} />
      <TextField label="Subject" path={`${prefix}.subject`} profile={profile} update={update} />
      <TextField label="Result" path={`${prefix}.result`} profile={profile} update={update} />
      <TextField label="Passing Year" path={`${prefix}.passingYear`} profile={profile} update={update} />
    </>
  );
}

type FieldGroupProps = {
  title?: string;
  prefix: string;
  profile: ApplicantProfile;
  update: (path: string, value: string | boolean) => void;
};

type FieldProps = {
  label: string;
  path: string;
  type?: string;
  profile: ApplicantProfile;
  update: (path: string, value: string | boolean) => void;
};

function TextField({ label, path, type = 'text', profile, update }: FieldProps) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input type={type} value={String(getAtPath(profile, path) ?? '')} onChange={(event) => update(path, event.target.value)} />
    </div>
  );
}

function LongTextField({ label, path, profile, update }: FieldProps) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Textarea value={String(getAtPath(profile, path) ?? '')} onChange={(event) => update(path, event.target.value)} />
    </div>
  );
}

function SelectField({ label, path, options, profile, update }: FieldProps & { options: string[] }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Select value={String(getAtPath(profile, path) ?? '')} onValueChange={(value) => update(path, value)}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function CheckField({ label, path, profile, update }: FieldProps) {
  return (
    <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
      <Checkbox checked={Boolean(getAtPath(profile, path))} onCheckedChange={(checked) => update(path, checked === true)} />
      <span>{label}</span>
    </label>
  );
}

function getAtPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current == null || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[key];
  }, source);
}

function setAtPath(target: unknown, path: string, value: string | boolean): void {
  const keys = path.split('.');
  let current = target as Record<string, unknown>;

  keys.slice(0, -1).forEach((key) => {
    const next = current[key];
    if (next == null || typeof next !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  });

  const finalKey = keys.at(-1);
  if (finalKey) current[finalKey] = value;
}
