import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ProspectCategory } from "../../types";
import {
  PROSPECT_CATEGORIES,
  canMarkNotInterested,
  prospectCategoryLabel
} from "../../lib/leadProspectCategory";
import { useSetProspectCategoryMutation } from "../../hooks/useSalesQueries";
import type { Lead } from "../../types";

type Props = {
  leadId: string;
  clientName: string;
  lead?: Pick<
    Lead,
    | "convertedAt"
    | "status"
    | "prospectCategory"
    | "interestedSampleShared"
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
  const [callbackLocal, setCallbackLocal] = useState("");
  const [sampleShared, setSampleShared] = useState<"true" | "false" | "">("");
  const setCategoryMut = useSetProspectCategoryMutation();

  useEffect(() => {
    if (!open) return;
    const nextCategory =
      fixedCategory ?? defaultCategory ?? lead?.prospectCategory ?? "NEW_LEAD";
    setCategory(nextCategory);
    setNote("");
    setCallbackLocal("");
    if (
      nextCategory === "INTERESTED" &&
      lead?.interestedSampleShared != null
    ) {
      setSampleShared(lead.interestedSampleShared ? "true" : "false");
    } else {
      setSampleShared("");
    }
  }, [open, fixedCategory, defaultCategory, lead?.prospectCategory, lead?.interestedSampleShared]);

  const selectableCategories = PROSPECT_CATEGORIES.filter((c) => {
    if (c === "NOT_INTERESTED" && lead && !canMarkNotInterested(lead)) return false;
    return true;
  });

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

    if (category === "CALLBACK_REQUESTED") {
      if (!callbackLocal) return;
      body.callbackAt = new Date(callbackLocal).toISOString();
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
    setCategoryMut.isPending ||
    (category === "CALLBACK_REQUESTED" && !callbackLocal) ||
    (category === "INTERESTED" && sampleShared === "");

  const trigger =
    variant === "listRow" ? (
      <Button type="button" variant="outline" className="min-h-11 w-full sm:w-auto" disabled={setCategoryMut.isPending}>
        {triggerLabel}
      </Button>
    ) : (
      <Button
        type="button"
        variant={variant === "ghost" ? "ghost" : "outline"}
        className={cn("min-h-11", variant !== "ghost" && "w-full sm:w-auto")}
        disabled={setCategoryMut.isPending}
      >
        {triggerLabel}
      </Button>
    );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Update category</AlertDialogTitle>
          <AlertDialogDescription>
            Set how you are tracking <span className="font-semibold text-foreground">{clientName}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          {fixedCategory == null ? (
            <div className="space-y-2">
              <Label htmlFor={`category-${leadId}`}>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ProspectCategory)}>
                <SelectTrigger id={`category-${leadId}`} className="min-h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectableCategories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {prospectCategoryLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {category === "CALLBACK_REQUESTED" ? (
            <div className="space-y-2">
              <Label htmlFor={`callback-${leadId}`}>Callback date and time</Label>
              <Input
                id={`callback-${leadId}`}
                type="datetime-local"
                className="min-h-11"
                value={callbackLocal}
                onChange={(e) => setCallbackLocal(e.target.value)}
              />
            </div>
          ) : null}

          {category === "INTERESTED" ? (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Website sample shared?</legend>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border-2 border-[#0A0A0A] px-3">
                  <input
                    type="radio"
                    name={`sample-${leadId}`}
                    checked={sampleShared === "true"}
                    onChange={() => setSampleShared("true")}
                  />
                  <span className="text-sm">Yes, sample shared</span>
                </label>
                <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border-2 border-[#0A0A0A] px-3">
                  <input
                    type="radio"
                    name={`sample-${leadId}`}
                    checked={sampleShared === "false"}
                    onChange={() => setSampleShared("false")}
                  />
                  <span className="text-sm">Not shared yet</span>
                </label>
              </div>
            </fieldset>
          ) : null}

          {category === "NOT_INTERESTED" ? (
            <div className="space-y-2">
              <Label htmlFor={`note-${leadId}`}>Note (optional)</Label>
              <Textarea
                id={`note-${leadId}`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Why is this prospect not interested?"
                maxLength={500}
              />
            </div>
          ) : category !== "INTERESTED" && category !== "CALLBACK_REQUESTED" ? (
            <div className="space-y-2">
              <Label htmlFor={`note-${leadId}`}>Note (optional)</Label>
              <Textarea
                id={`note-${leadId}`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
              />
            </div>
          ) : null}
        </div>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel className="min-h-11 w-full sm:w-auto">Cancel</AlertDialogCancel>
          <Button
            type="button"
            className="min-h-11 w-full sm:w-auto"
            disabled={confirmDisabled}
            onClick={handleConfirm}
          >
            {setCategoryMut.isPending ? "Saving…" : "Save category"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
