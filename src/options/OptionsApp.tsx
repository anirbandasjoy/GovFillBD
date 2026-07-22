import { useEffect, useState } from 'react';
import { Plus, UserRound } from 'lucide-react';
import { ProfileForm } from '@/popup/components/ProfileForm';
import { Button } from '@/popup/components/ui/button';
import { Card, CardContent, CardHeader } from '@/popup/components/ui/card';
import { createEmptyProfile } from '@/profiles/createEmptyProfile';
import type { ApplicantProfile } from '@/schemas/applicantProfile';
import { deleteProfile, listProfiles, upsertProfile } from '@/storage/profileStorage';
import { formatDateTime } from '@/utils/date';

type PageMode = 'list' | 'form';

export function OptionsApp() {
  const [profiles, setProfiles] = useState<ApplicantProfile[]>([]);
  const [mode, setMode] = useState<PageMode>('list');
  const [editingProfile, setEditingProfile] = useState<ApplicantProfile>();
  const [error, setError] = useState('');

  useEffect(() => {
    void refreshProfiles();
  }, []);

  async function refreshProfiles() {
    setProfiles(await listProfiles());
  }

  function startCreate() {
    setError('');
    setEditingProfile(createEmptyProfile(''));
    setMode('form');
  }

  function startEdit(profile: ApplicantProfile) {
    setError('');
    setEditingProfile(profile);
    setMode('form');
  }

  async function saveProfile(profile: ApplicantProfile) {
    await upsertProfile(profile);
    await refreshProfiles();
    setEditingProfile(undefined);
    setMode('list');
  }

  async function removeProfile(profileId: string) {
    await deleteProfile(profileId);
    await refreshProfiles();
  }

  if (mode === 'form') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 px-6 py-6">
        <div className="mx-auto max-w-4xl rounded-2xl border bg-white px-4 shadow-sm">
          <ProfileForm initialProfile={editingProfile} onCancel={() => setMode('list')} onSave={saveProfile} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 px-8 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-start justify-between gap-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">GovApply Autofill</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Applicant Profile Database</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Create and maintain complete Bangladesh government job application profiles here. The popup stays small and only uses these saved profiles to fill active application forms.
            </p>
          </div>
          <Button onClick={startCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Applicant Profile
          </Button>
        </header>

        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {profiles.length === 0 ? (
          <Card className="border-dashed bg-white/80">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-emerald-50 p-4 text-emerald-700">
                <UserRound className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">No applicant profiles yet</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Create the first profile with personal, education, address, quota, training, experience, and publication information.
              </p>
              <Button className="mt-6" onClick={startCreate}>
                Create Applicant Profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {profiles.map((profile) => (
              <Card key={profile.profileId} className="bg-white">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">{profile.profileName}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Last updated: {formatDateTime(profile.updatedAt)}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Profile</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <ProfileFact label="Mobile" value={profile.contact.mobileNumber} />
                    <ProfileFact label="District" value={profile.address.presentAddress.district} />
                    <ProfileFact label="Quota" value={profile.quota.quotaType} />
                    <ProfileFact label="Education" value={profile.education.bachelor.degree || profile.education.hsc.examination} />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" onClick={() => startEdit(profile)}>
                      Edit Profile
                    </Button>
                    <Button variant="ghost" onClick={() => removeProfile(profile.profileId)}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function ProfileFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 truncate font-medium text-foreground">{value || 'Not provided'}</div>
    </div>
  );
}
