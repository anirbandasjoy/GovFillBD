import { useEffect, useState } from 'react';
import { Edit3, Plus, Trash2, UserRound } from 'lucide-react';
import { ProfileForm } from '@/popup/components/ProfileForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/popup/components/ui/alert-dialog';
import { Badge } from '@/popup/components/ui/badge';
import { Button } from '@/popup/components/ui/button';
import { Card, CardContent, CardHeader } from '@/popup/components/ui/card';
import { Separator } from '@/popup/components/ui/separator';
import { createEmptyProfile } from '@/profiles/createEmptyProfile';
import type { ApplicantProfile } from '@/schemas/applicantProfile';
import { deleteProfile, listProfiles, upsertProfile } from '@/storage/profileStorage';
import { formatDateTime } from '@/utils/date';

type PageMode = 'list' | 'form';

export function OptionsApp() {
  const [profiles, setProfiles] = useState<ApplicantProfile[]>([]);
  const [mode, setMode] = useState<PageMode>('list');
  const [editingProfile, setEditingProfile] = useState<ApplicantProfile>();
  const [pendingEditProfile, setPendingEditProfile] = useState<ApplicantProfile>();
  const [pendingDeleteProfile, setPendingDeleteProfile] = useState<ApplicantProfile>();
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
    setPendingEditProfile(undefined);
    setMode('form');
  }

  async function saveProfile(profile: ApplicantProfile) {
    await upsertProfile(profile);
    await refreshProfiles();
    setEditingProfile(undefined);
    setMode('list');
  }

  async function removeProfile(profile: ApplicantProfile) {
    await deleteProfile(profile.profileId);
    setPendingDeleteProfile(undefined);
    await refreshProfiles();
  }

  if (mode === 'form') {
    return (
      <main className="min-h-screen bg-muted/30 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-xl border bg-card px-4">
          <ProfileForm initialProfile={editingProfile} onCancel={() => setMode('list')} onSave={saveProfile} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-xl border bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
              <Badge variant="secondary" className="text-primary">GovApply Autofill</Badge>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Applicant Profile Database</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Create and maintain complete Bangladesh government job application profiles here. The popup stays small and only uses these saved profiles to fill active application forms.
            </p>
          </div>
            <Button className="w-full sm:w-auto" onClick={startCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Applicant Profile
          </Button>
          </div>
        </header>

        {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

        {profiles.length === 0 ? (
          <Card className="border-dashed bg-card">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-primary/10 p-4 text-primary">
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
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {profiles.map((profile) => (
              <Card key={profile.profileId} className="bg-card transition-colors hover:border-primary/40">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-lg font-semibold">{profile.profileName}</h2>
                        <Badge variant="outline" className="shrink-0 text-primary">Profile</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">Updated {formatDateTime(profile.updatedAt)}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPendingEditProfile(profile)}>
                        <Edit3 className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setPendingDeleteProfile(profile)}>
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Separator className="mb-4" />
                  <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <ProfileFact label="Mobile" value={profile.contact.mobileNumber} />
                    <ProfileFact label="District" value={profile.address.presentAddress.district} />
                    <ProfileFact label="Quota" value={profile.quota.quotaType} />
                    <ProfileFact label="Education" value={profile.education.bachelor.degree || profile.education.hsc.examination} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={Boolean(pendingEditProfile)} onOpenChange={(open) => !open && setPendingEditProfile(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit applicant profile?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to edit {pendingEditProfile?.profileName || 'this applicant profile'}. Continue only if you want to change the saved government application information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => pendingEditProfile && startEdit(pendingEditProfile)}>Continue Editing</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(pendingDeleteProfile)} onOpenChange={(open) => !open && setPendingDeleteProfile(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete applicant profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {pendingDeleteProfile?.profileName || 'this applicant profile'} from local storage. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => pendingDeleteProfile && void removeProfile(pendingDeleteProfile)}>
              Delete Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function ProfileFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 truncate font-medium text-foreground">{value || 'Not provided'}</div>
    </div>
  );
}
