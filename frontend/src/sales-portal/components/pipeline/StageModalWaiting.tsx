import { PortalStatusChip } from "../ui/PortalStatusChip";

function StageModalStatusFooter({ variant }: { variant: "waiting" | "verified" }) {
  return (
    <div className="flex w-full justify-center sm:justify-end">
      <PortalStatusChip
        kind={variant === "verified" ? "complete" : "waiting"}
        label={variant === "verified" ? "Verified by admin" : "Waiting on admin"}
      />
    </div>
  );
}

export function StageModalWaitingFooter() {
  return <StageModalStatusFooter variant="waiting" />;
}

export function StageModalVerifiedFooter() {
  return <StageModalStatusFooter variant="verified" />;
}