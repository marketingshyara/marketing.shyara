import type { PortalStatusChipKind } from "../components/ui/PortalStatusChip";

export const PORTAL_STATUS_STYLES: Record<
  PortalStatusChipKind,
  { chip: string; icon: string }
> = {
  action: {
    chip: "border-l-[3px] border-[#FF3333] border-y-2 border-r-2 border-[#0A0A0A] bg-white text-[#0A0A0A] shadow-[2px_2px_0_0_#0A0A0A]",
    icon: "text-[#FF3333]",
  },
  waiting: {
    chip: "border-2 border-[#0A0A0A] bg-[#FAFAFA] text-[#0A0A0A]/80",
    icon: "text-[#0A0A0A]/60",
  },
  complete: {
    chip: "border-2 border-[#0A0A0A]/30 bg-white text-[#0A0A0A]/60",
    icon: "text-[#FF3333]",
  },
  locked: {
    chip: "border-2 border-dashed border-[#0A0A0A]/40 bg-[#F0F0F0] text-[#0A0A0A]/50",
    icon: "text-[#0A0A0A]/40",
  },
  idle: {
    chip: "border-2 border-[#0A0A0A]/20 bg-white text-[#0A0A0A]/70",
    icon: "text-[#0A0A0A]/50",
  },
};

/** Brutalist accent for verified payment / success ticks */
export const PORTAL_VERIFIED_ACCENT = "text-[#FF3333]";

/** Waiting-on-admin banner tones (replaces amber-*) */
export const PORTAL_WAITING_BANNER =
  "border-2 border-[#0A0A0A] bg-[#FAFAFA] text-[#0A0A0A]";

export const PORTAL_WAITING_TEXT = "text-[#0A0A0A]/70";

/** Action-needed banner tones */
export const PORTAL_ACTION_BANNER =
  "border-2 border-[#0A0A0A] border-l-[4px] border-l-[#FF3333] bg-white text-[#0A0A0A]";
