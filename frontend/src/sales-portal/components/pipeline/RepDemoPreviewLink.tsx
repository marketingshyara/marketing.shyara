import { memo, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { PortalLinkDisplay } from "../ui/PortalLinkDisplay";

export type RepDemoPreviewContext = "building" | "approve" | "submitted";

const HELPER_COPY: Record<RepDemoPreviewContext, string> = {
  building: "Preview is ready to share. Admin may still be finalizing the demo.",
  approve: "Open the demo and confirm with your client before marking demo approved.",
  submitted: "Submitted demo preview (read-only)."
};

type Props = {
  previewUrl: string | null | undefined;
  context: RepDemoPreviewContext;
  id?: string;
};

export const RepDemoPreviewLink = memo(function RepDemoPreviewLink({
  previewUrl,
  context,
  id = "rep-demo-preview"
}: Props) {
  const trimmedUrl = useMemo(() => previewUrl?.trim() || null, [previewUrl]);
  const hasUrl = trimmedUrl != null;
  const hintId = `${id}-hint`;

  return (
    <div className="space-y-2">
      <Label htmlFor={hasUrl ? undefined : id}>Demo preview</Label>
      {hasUrl ? (
        <>
          <p id={hintId} className="text-xs text-muted-foreground">
            {HELPER_COPY[context]}
          </p>
          <PortalLinkDisplay
            url={trimmedUrl}
            copyLabel="Demo preview"
            aria-describedby={hintId}
          />
        </>
      ) : (
        <p id={id} className="text-sm text-muted-foreground" role="status">
          Demo preview not ready yet — waiting on technical team.
        </p>
      )}
    </div>
  );
});
