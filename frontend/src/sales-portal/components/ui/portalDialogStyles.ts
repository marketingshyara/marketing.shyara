import { cn } from "@/lib/utils";

/** Portaled surfaces must carry portal tokens (they render outside `.portal-site`). */
export const portalDialogSurfaceClass =
  "portal-site w-[calc(100%-1.5rem)] max-w-lg border-2 border-[#0A0A0A] bg-white text-[#0A0A0A] shadow-[4px_4px_0_0_#0A0A0A] sm:rounded-none";

/** Bottom sheet menu — full width, brutal light surface (portals render outside `.portal-site`). */
export const portalSheetBottomSurfaceClass =
  "portal-site portal-dialog-surface w-full max-w-none rounded-none border-x-0 border-b-0 border-t-2 border-[#0A0A0A] bg-white text-[#0A0A0A] shadow-[0_-4px_0_0_#0A0A0A]";

export const portalPopoverSurfaceClass =
  "portal-site portal-dialog-surface z-[80] border-2 border-[#0A0A0A] bg-white text-[#0A0A0A] shadow-[4px_4px_0_0_#0A0A0A]";

export const portalFieldLabelClass =
  "text-[10px] font-bold uppercase tracking-[0.2em] text-[#0A0A0A]/60";

export const portalSelectTriggerClass = "portal-brutal-input min-h-11 w-full font-semibold";

export const portalSelectContentClass =
  "portal-site z-[80] border-2 border-[#0A0A0A] bg-white text-[#0A0A0A] shadow-[4px_4px_0_0_#0A0A0A]";

export function portalChoiceButtonClass(active: boolean): string {
  return cn(
    "min-h-12 w-full touch-manipulation border-2 border-[#0A0A0A] px-3 text-sm font-bold uppercase tracking-wide transition-all",
    active
      ? "bg-[#FF3333] text-white shadow-[2px_2px_0_0_#0A0A0A]"
      : "bg-white text-[#0A0A0A] hover:bg-[#FAFAFA]"
  );
}
