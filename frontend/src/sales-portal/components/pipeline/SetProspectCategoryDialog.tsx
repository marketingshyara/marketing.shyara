import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { CallbackDateTimePicker } from "./CallbackDateTimePicker";
import type { ProspectCategory } from "../../types";
import {
  PROSPECT_CATEGORIES,
  canMarkNotInterested,
  prospectCategoryLabel
} from "../../lib/leadProspectCategory";
import { useSetProspectCategoryMutation } from "../../hooks/useSalesQueries";
import type { Lead } from "../../types";
import { BrutalButton } from "../brutalist/BrutalButton";
import {
  portalChoiceButtonClass,
  portalDialogSurfaceClass,
  portalFieldLabelClass,
  portalSelectContentClass,
  portalSelectTriggerClass
} from "../ui/portalDialogStyles";

type Props = {
  leadId: string;
  clientName: string;
  lead?: Pick<
    Lead,
    | "convertedAt"
    | "status"
    | "prospectCategory"
    | "interestedSampleShared"
    | "callbackScheduledAt"
    | "payments"
    | "project"
  >;
  /** Pre-select category when opening */
  defaultCategory?: ProspectCategory;
  /** Lock category field (e.g. sample-only update) */
  fixedCategory?: ProspectCategory;
  triggerLabel?: string;
  variant?: "outline" | "listRow" | "ghost";
  onUpdated?: (category: ProspectCategory) => void;
};

function defaultSampleForInterested(lead?: Props["lead"]): "true" | "false" {
  if (lead?.interestedSampleShared === true) return "true";
  return "false";
}

export function SetProspectCategoryDialog({
  leadId,
  clientName,
  lead,
  defaultCategory,
  fixedCategory,
  triggerLabel = "Set category",
  variant = "outline",
  onUpdated
}: Props) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ProspectCategory>(
    fixedCategory ?? defaultCategory ?? lead?.prospectCategory ?? "NEW_LEAD"
  );
  const [note, setNote] = useState("");
  const [callbackAt, setCallbackAt] = useState<Date | undefined>(undefined);
  const [sampleShared, setSampleShared] = useState<"true" | "false" | "">("");
  const setCategoryMut = useSetProspectCategoryMutation();

  useEffect(() => {
    if (!open) return;
    const nextCategory =
      fixedCategory ?? defaultCategory ?? lead?.prospectCategory ?? "NEW_LEAD";
    setCategory(nextCategory);
    setNote("");
    if (nextCategory === "CALLBACK_REQUESTED" && lead?.callbackScheduledAt) {
      setCallbackAt(new Date(lead.callbackScheduledAt));
    } else {
      setCallbackAt(undefined);
    }
    if (nextCategory === "INTERESTED") {
      setSampleShared(defaultSampleForInterested(lead));
    } else {
      setSampleShared("");
    }
  }, [
    open,
    fixedCategory,
    defaultCategory,
    lead?.prospectCategory,
    lead?.interestedSampleShared,
    lead?.callbackScheduledAt
  ]);

  const selectableCategories = PROSPECT_CATEGORIES.filter((c) => {
    if (c === "NOT_INTERESTED" && lead && !canMarkNotInterested(lead)) return false;
    return true;
  });

  const handleCategoryChange = (next: ProspectCategory) => {
    setCategory(next);
    if (next === "INTERESTED") {
      setSampleShared(defaultSampleForInterested(lead));
    } else {
      setSampleShared("");
    }
  };

  const handleConfirm = () => {
    const body: {
      category: ProspectCategory;
      note?: string;
      callbackAt?: string;
      sampleShared?: boolean;
    } = { category };

    if (category === "NOT_INTERESTED") {
      const trimmed = note.trim();
      if (trimmed) body.note = trimmed;
    } else if (note.trim()) {
      body.note = note.trim();
    }

    if (category === "CALLBACK_REQUESTED" && callbackAt) {
      body.callbackAt = callbackAt.toISOString();
    }

    if (category === "INTERESTED") {
      if (sampleShared === "") return;
      body.sampleShared = sampleShared === "true";
    }

    setCategoryMut.mutate(
      { leadId, ...body },
      {
        onSuccess: () => {
          setOpen(false);
          onUpdated?.(category);
        }
      }
    );
  };

  const confirmDisabled =
    setCategoryMut.isPending || (category === "INTERESTED" && sampleShared === "");

  const trigger =
    variant === "listRow" ? (
      <BrutalButton
        type="button"
        variant="secondary"
        className="w-full sm:w-auto"
        disabled={setCategoryMut.isPending}
      >
        {triggerLabel}
      </BrutalButton>
    ) : (
      <BrutalButton
        type="button"
        variant={variant === "ghost" ? "ghost" : "secondary"}
        className={cn(variant !== "ghost" && "w-full sm:w-auto")}
        disabled={setCategoryMut.isPending}
      >
        {triggerLabel}
      </BrutalButton>
    );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent
        className={cn(
          portalDialogSurfaceClass,
          "portal-dialog-surface max-h-[min(92dvh,40rem)] gap-0 overflow-hidden p-0"
        )}
      >
        <AlertDialogHeader className="space-y-1 border-b-2 border-[#0A0A0A]/10 px-4 py-4 text-left sm:px-5">
          <AlertDialogTitle className="font-heading text-lg font-black uppercase tracking-tight">
            Update category
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-[#0A0A0A]/60">
            Tracking <span className="font-bold text-[#0A0A0A]">{clientName}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          {fixedCategory == null ? (
            <div className="space-y-2">
              <Label htmlFor={`category-${leadId}`} className={portalFieldLabelClass}>
                Category
              </Label>
              <Select value={category} onValueChange={(v) => handleCategoryChange(v as ProspectCategory)}>
                <SelectTrigger id={`category-${leadId}`} className={portalSelectTriggerClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={portalSelectContentClass}>
                  {selectableCategories.map((c) => (
                    <SelectItem key={c} value={c} className="font-semibold">
                      {prospectCategoryLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {category === "CALLBACK_REQUESTED" ? (
            <CallbackDateTimePicker
              id={`callback-${leadId}`}
              value={callbackAt}
              onChange={setCallbackAt}
              disabled={setCategoryMut.isPending}
            />
          ) : null}

          {category === "INTERESTED" ? (
            <fieldset className="space-y-2">
              <legend className={portalFieldLabelClass}>Website sample shared?</legend>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  className={portalChoiceButtonClass(sampleShared === "true")}
                  onClick={() => setSampleShared("true")}
                >
                  Yes — shared
                </button>
                <button
                  type="button"
                  className={portalChoiceButtonClass(sampleShared === "false")}
                  onClick={() => setSampleShared("false")}
                >
                  Not shared yet
                </button>
              </div>
            </fieldset>
          ) : null}

          {category === "NOT_INTERESTED" ? (
            <div className="space-y-2">
              <Label htmlFor={`note-${leadId}`} className={portalFieldLabelClass}>
                Note (optional)
              </Label>
              <Textarea
                id={`note-${leadId}`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Why not interested?"
                maxLength={500}
                className="portal-brutal-input min-h-[4.5rem] resize-none"
              />
            </div>
          ) : category !== "INTERESTED" && category !== "CALLBACK_REQUESTED" ? (
            <div className="space-y-2">
              <Label htmlFor={`note-${leadId}`} className={portalFieldLabelClass}>
                Note (optional)
              </Label>
              <Textarea
                id={`note-${leadId}`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
                className="portal-brutal-input min-h-[4.5rem] resize-none"
              />
            </div>
          ) : null}
        </div>

        <AlertDialogFooter className="flex-col-reverse gap-2 border-t-2 border-[#0A0A0A]/10 px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
          <AlertDialogCancel asChild>
            <BrutalButton type="button" variant="secondary" className="w-full sm:w-auto">
              Cancel
            </BrutalButton>
          </AlertDialogCancel>
          <BrutalButton
            type="button"
            variant="primary"
            className="w-full sm:w-auto"
            disabled={confirmDisabled}
            onClick={handleConfirm}
          >
            {setCategoryMut.isPending ? "Saving…" : "Save"}
          </BrutalButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
