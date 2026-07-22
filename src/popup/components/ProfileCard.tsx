import { Button } from '@/popup/components/ui/button';
import { Badge } from '@/popup/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/popup/components/ui/card';
import { Separator } from '@/popup/components/ui/separator';
import type { ApplicantProfile } from '@/schemas/applicantProfile';
import { formatDateTime } from '@/utils/date';

type ProfileCardProps = {
  profile: ApplicantProfile;
  filling: boolean;
  onFill: (profileId: string) => void;
};

export function ProfileCard({ profile, filling, onFill }: ProfileCardProps) {
  return (
    <Card className="overflow-hidden border-primary/20 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold leading-tight">{profile.profileName}</h2>
            <p className="mt-1 text-xs text-muted-foreground">Updated {formatDateTime(profile.updatedAt)}</p>
          </div>
          <Badge variant="secondary" className="shrink-0 text-[10px] text-primary">
            BD Govt
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Separator />
        <Button className="w-full" disabled={filling} onClick={() => onFill(profile.profileId)}>
          {filling ? 'Filling...' : 'Fill Application'}
        </Button>
      </CardContent>
    </Card>
  );
}
