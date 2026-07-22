import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { FillResultSummary } from "@/popup/components/FillResultSummary";
import { ProfileCard } from "@/popup/components/ProfileCard";
import { Button } from "@/popup/components/ui/button";
import type { FillResult, FillResponse } from "@/autofill/types";
import { listProfiles } from "@/storage/profileStorage";
import type { ApplicantProfile } from "@/schemas/applicantProfile";

export function App() {
  const [profiles, setProfiles] = useState<ApplicantProfile[]>([]);
  const [fillingProfileId, setFillingProfileId] = useState<string>();
  const [fillResult, setFillResult] = useState<FillResult>();
  const [error, setError] = useState("");

  useEffect(() => {
    void refreshProfiles();
  }, []);

  async function refreshProfiles() {
    setProfiles(await listProfiles());
  }

  async function openProfileDatabase() {
    await chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
    window.close();
  }

  async function fillApplication(profileId: string) {
    setError("");
    setFillResult(undefined);
    setFillingProfileId(profileId);
    try {
      const response = (await chrome.runtime.sendMessage({
        type: "GOVAPPLY_START_FILL",
        profileId,
      })) as FillResponse;

      if (!response.ok) {
        setError(response.error);
        return;
      }

      setFillResult(response.result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to fill the current page",
      );
    } finally {
      setFillingProfileId(undefined);
    }
  }

  return (
    <main className="min-h-[480px] bg-muted/30 p-4">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight">
            GovApply Autofill
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Bangladesh Government Job Application Assistant
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={openProfileDatabase}
          title="Manage profiles"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </header>

      <div className="space-y-3">
        {profiles.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-4 text-center">
            <h2 className="text-sm font-semibold">No applicant profiles yet</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Save applicant information once, then fill government recruitment
              forms in one click.
            </p>
            <Button className="mt-4 w-full" onClick={openProfileDatabase}>
              Create Applicant Profile
            </Button>
          </div>
        ) : (
          profiles.map((profile) => (
            <ProfileCard
              key={profile.profileId}
              profile={profile}
              filling={fillingProfileId === profile.profileId}
              onFill={fillApplication}
            />
          ))
        )}

        {profiles.length > 0 && (
          <Button
            variant="outline"
            className="w-full bg-card"
            onClick={openProfileDatabase}
          >
            Manage Applicant Profiles
          </Button>
        )}

        {fillResult && <FillResultSummary result={fillResult} />}
        {error && (
          <p className="rounded-md bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </p>
        )}

        <p className="rounded-md border bg-card p-3 text-[11px] leading-relaxed text-muted-foreground">
          GovApply never submits forms, solves CAPTCHA, accepts declarations, or
          uploads files automatically.
        </p>
      </div>
    </main>
  );
}
