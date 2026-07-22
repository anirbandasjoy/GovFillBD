import { Button } from '@/popup/components/ui/button';
import { Card, CardContent, CardHeader } from '@/popup/components/ui/card';
import type { ApplicantProfile } from '@/schemas/applicantProfile';
import { formatDateTime } from '@/utils/date';

type ProfileCardProps = {
  profile: ApplicantProfile;
  filling: boolean;
  onFill: (profileId: string) => void;
};

export function ProfileCard({ profile, filling, onFill }: ProfileCardProps) {
  return (
    <Card className="overflow-hidden border-emerald-100">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold leading-tight">{profile.profileName}</h2>
            <p className="mt-1 text-xs text-muted-foreground">Last updated: {formatDateTime(profile.updatedAt)}</p>
          </div>
          <div className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
            BD Govt
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button className="w-full" disabled={filling} onClick={() => onFill(profile.profileId)}>
          {filling ? 'Filling...' : 'Fill Application'}
        </Button>
      </CardContent>
    </Card>
  );
}
